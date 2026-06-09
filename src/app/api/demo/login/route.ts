import { NextRequest, NextResponse } from "next/server";
import { validateDemoCredentials, DEMO_COOKIE, isDemoMode, resetDemoStore } from "@/lib/demo";

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Demo mode desativado" }, { status: 403 });
  }

  const { email, password } = await request.json();

  if (!validateDemoCredentials(email, password)) {
    return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 });
  }

  resetDemoStore();

  const response = NextResponse.json({ success: true });
  response.cookies.set(DEMO_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(DEMO_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
