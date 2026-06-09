import { cookies } from "next/headers";
import { DEMO_COOKIE } from "@/lib/demo";
import { isDemoEnabled } from "@/lib/env";

export async function isDemoSession(): Promise<boolean> {
  if (!isDemoEnabled()) return false;
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_COOKIE)?.value === "1";
}
