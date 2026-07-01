import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { AdminHeader } from "./AdminHeader";

// Guards every page in the (panel) group. The /admin/login page lives outside
// this group, so it is intentionally not gated here.
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-bg">
      <AdminHeader email={admin.email} />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
