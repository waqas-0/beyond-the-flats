import { createClient, createServiceClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  email: string;
  role: "admin" | "superadmin";
  created_at: string;
};

export type AdminSession = {
  /** The authenticated Supabase user (BTF team member). */
  userId: string;
  email: string;
  admin: AdminUser;
};

/**
 * Resolve the current admin session, or null if the caller is not a BTF admin.
 *
 * Admins authenticate with email/password (Supabase Auth), but authority comes
 * from membership in `public.admin_users`. That table has no RLS read policy
 * (service-role only), so the gate is checked here with the service client —
 * never trusted from the client.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase();
  if (!user || !email) return null;

  const service = createServiceClient();
  const { data: admin, error } = await service
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[admin] membership check:", error.message);
    return null;
  }
  if (!admin) return null;

  return { userId: user.id, email, admin: admin as AdminUser };
}
