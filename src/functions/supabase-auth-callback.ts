import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase Environment Variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (!code) {
    return Response.redirect(`${origin}/signup?error=missing_code`, 302);
  }

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      return Response.redirect(`${origin}/signup?error=auth_failed`, 302);
    }

    const { user } = data;

    if (user) {
      const fullName = user.user_metadata?.full_name || 'Member Fitapp';

      // 1. Sinkronisasi Newsletter (Selaras dengan subscribersApi)
      if (user.email) {
        await supabase.from("subscribers").upsert({
          email: user.email.toLowerCase(),
          name: fullName,
        }, { onConflict: 'email' });
      }

      // 2. Sinkronisasi Profil (Selaras dengan authApi.ts)
      // REVISI: Menggunakan fullName langsung agar konsisten dengan CommentSection
      await supabase.from("user_profiles").upsert({
        id: user.id,
        username: fullName, // Tidak lagi menggunakan random suffix agar nama di komen sesuai input
        avatar_url: user.user_metadata?.avatar_url ?? null,
      }, { onConflict: 'id' });
    }

    // Berhasil: Arahkan ke homepage
    return Response.redirect(`${origin}/`, 302);

  } catch (err: unknown) {
    console.error("Callback fatal error:", err);
    return Response.redirect(`${origin}/signup?error=server_error`, 302);
  }
}