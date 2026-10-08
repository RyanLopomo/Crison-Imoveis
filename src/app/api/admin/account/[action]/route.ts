import { accountAction } from "@/lib/account";
export const maxDuration = 60;
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  return accountAction(request, (await context.params).action);
}
