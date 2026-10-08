import { AdminAccount } from "@/components/admin/AdminAccount";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function Page() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return <AdminAccount name={admin.name} email={admin.email} />;
}
