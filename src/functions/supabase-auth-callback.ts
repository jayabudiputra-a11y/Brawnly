import { createClient } from "@supabase/supabase-js";

/**
 * =====================================================
 * ENV (SESUAI .env.local)
 * =====================================================
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables."
  );
}

/**
 * =====================================================
 * SUPABASE CLIENT (ANON)
 * =====================================================
 */
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false, // server-side, tidak perlu simpan session
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

/**
 * =====================================================
 * AUTH CALLBACK HANDLER
 * =====================================================
 */
export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Code missing", { status: 400 });
  }

  try {
    const { data, error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      return new Response(
        JSON.stringify({
          error: error?.message ?? "Authentication failed",
        }),
        { status: 401 }
      );
    }

    /**
     * =====================================================
     * INSERT SUBSCRIBER (ANON + RLS)
     * =====================================================
     */
    if (data.user?.email) {
      const { error: insertError } = await supabase
        .from("subscribers")
        .upsert(
          {
            email: data.user.email,
            name:
              data.user.user_metadata?.full_name ??
              "Anonymous",
            is_active: true,
          },
          {
            onConflict: "email",
          }
        );

      if (insertError) {
        console.warn(
          "Subscriber upsert skipped:",
          insertError.message
        );
      }
    }

    /**
     * =====================================================
     * SET COOKIE & REDIRECT
     * =====================================================
     */
    const { access_token, refresh_token, expires_in } =
      data.session;

    const expirationTime = new Date();
    expirationTime.setSeconds(
      expirationTime.getSeconds() + expires_in
    );

    const headers = new Headers();

    headers.append(
      "Set-Cookie",
      `supabase-access-token=${access_token}; Path=/; Expires=${expirationTime.toUTCString()}; HttpOnly; Secure; SameSite=Lax`
    );

    headers.append(
      "Set-Cookie",
      `supabase-refresh-token=${refresh_token}; Path=/; Expires=${expirationTime.toUTCString()}; HttpOnly; Secure; SameSite=Lax`
    );

    headers.set("Location", "/dashboard");

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (err) {
    console.error("Auth callback error:", err);
    return new Response("Server Error", { status: 500 });
  }
}
