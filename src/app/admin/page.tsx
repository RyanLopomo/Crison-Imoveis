import { AdminProperties } from "@/components/admin/AdminProperties";
import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <AdminProperties />
    </main>
  );
}
