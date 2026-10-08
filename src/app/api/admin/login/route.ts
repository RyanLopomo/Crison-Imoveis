import { accountAction } from "@/lib/account";
export async function POST(request: Request) { return accountAction(request, "login"); }
