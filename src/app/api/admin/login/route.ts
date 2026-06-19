import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// BTF admin sign-in. Authenticates email/password against Supabase Auth, then
// gates on membership in `admin_users`. A valid Supabase user who is NOT an
// admin is signed back out — being able to log in is not the same as being BTF
// staff.
export async function POST(request: NextRequest) {
  let email: unknown;
  let password: unknown;
  try {
    ({ email, password } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // Gate on admin_users membership (service client — table is not client-readable).
  const service = createServiceClient();
  const { data: admin } = await service
    .from("admin_users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (!admin) {
    // Authenticated, but not BTF staff — don't leave a usable session behind.
    await supabase.auth.signOut();
    return Response.json({ error: "This account is not authorised for admin access." }, { status: 403 });
  }

  return Response.json({ ok: true });
}
