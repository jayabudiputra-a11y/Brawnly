import { createClient } from "@supabase/supabase-js";

/* ======================
    
   ====================== */
const _0xcb = [
  "VITE_SUPABASE_URL",         
  "VITE_SUPABASE_ANON_KEY",    
  "subscribers",               
  "user_profiles",             
  "email",                     
  "id",                        
  "Member Brawnly"              
] as const;

const _c = (i: number) => _0xcb[i] as string;

const _U = process.env[_c(0)];
const _K = process.env[_c(1)];

if (!_U || !_K) {
  throw new Error("SECURE_AUTH_NODE_FAULT");
}

const supabase = createClient(_U, _K, {
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
    return Response.redirect(`${origin}/signup?err=x01`, 302);
  }

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      return Response.redirect(`${origin}/signup?err=x02`, 302);
    }

    const { user } = data;

    if (user) {
      const _NAME = user.user_metadata?.full_name || _c(6);

      if (user.email) {
        await (supabase.from(_c(2)) as any).upsert(
          {
            [_c(4)]: user.email.toLowerCase(),
            name: _NAME,
          },
          { onConflict: _c(4) }
        );
      }

      await (supabase.from(_c(3)) as any).upsert(
        {
          [_c(5)]: user.id,
          username: _NAME,
          avatar_url: user.user_metadata?.avatar_url ?? null,
        },
        { onConflict: _c(5) }
      );
    }

    return Response.redirect(`${origin}/`, 302);
  } catch (err: unknown) {
    return Response.redirect(`${origin}/signup?err=x03`, 302);
  }
}