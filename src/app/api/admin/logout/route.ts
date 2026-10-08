import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/auth";
import { assertSameOrigin, mutationError } from "@/lib/security";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await destroyAdminSession();
    return NextResponse.json({ ok: true });
  } catch (error) { return mutationError(error); }
}
