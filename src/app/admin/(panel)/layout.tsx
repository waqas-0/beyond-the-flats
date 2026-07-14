import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { AdminShell } from "./AdminShell";

// Guards every page in the (panel) group. The /admin/login page lives outside
// this group, so it is intentionally not gated here.
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
