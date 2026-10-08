import { AdminProperties } from "@/components/admin/AdminProperties";
import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function Page() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <AdminProperties mode="list" />;
}
