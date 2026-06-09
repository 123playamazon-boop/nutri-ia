import { cookies } from "next/headers";
import { DEMO_COOKIE, isDemoMode } from "@/lib/demo";

export async function isDemoSession(): Promise<boolean> {
  if (!isDemoMode()) return false;
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_COOKIE)?.value === "1";
}
