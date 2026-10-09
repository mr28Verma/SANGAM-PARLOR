import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logoutAction } from "@/app/admin/actions";
import { AdminNavigation } from "@/app/admin/admin-navigation";
import { AdminTopbar } from "@/app/admin/admin-topbar";

export default async function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/login");
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <Link className="admin-wordmark" href="/admin"><span className="admin-brand-mark">S</span><span className="admin-brand-copy"><strong>SANGAM</strong><small>PARLOUR</small></span></Link>
          <p className="admin-side-label">SALON MANAGEMENT</p>
          <AdminNavigation />
        </div>
        <div className="admin-sidebar-bottom">
          <div className="admin-owner-card"><span className="admin-owner-mark" aria-hidden="true">S</span><span><strong>Sangam Management</strong><small>Owner Access</small></span></div>
          <form action={logoutAction}><button className="admin-logout" type="submit"><span aria-hidden="true">↪</span> Sign out</button></form>
        </div>
      </aside>
      <div className="admin-main-column">
        <AdminTopbar />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
