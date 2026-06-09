import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE } from "@/lib/demo";
import { hasSupabaseConfig, isDemoEnabled } from "@/lib/env";

const DEMO_APP_PATHS = ["/dashboard", "/plano", "/diary", "/chat", "/onboarding", "/settings"];
const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth/callback", "/obrigado"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );
}

function handleDemoRouting(request: NextRequest, pathname: string): NextResponse {
  const hasDemoCookie = request.cookies.get(DEMO_COOKIE)?.value === "1";

  if (
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/stripe/checkout") ||
    pathname.startsWith("/api/demo")
  ) {
    return NextResponse.next({ request });
  }

  if (pathname.startsWith("/api/") || pathname.startsWith("/auth")) {
    return NextResponse.next({ request });
  }

  if (hasDemoCookie) {
    if (isPublicPath(pathname) && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname === "/subscribe") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (!isPublicPath(pathname) && !DEMO_APP_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next({ request });
  }

  // Sem cookie demo: libera páginas públicas, protege o resto
  if (!isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next({ request });
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  try {
    if (
      pathname.startsWith("/api/stripe/webhook") ||
      pathname.startsWith("/api/stripe/checkout")
    ) {
      return NextResponse.next({ request });
    }

    // Sem Supabase configurado → modo demo (não quebra o middleware)
    if (isDemoEnabled()) {
      return handleDemoRouting(request, pathname);
    }

    if (!hasSupabaseConfig()) {
      if (isPublicPath(pathname) || pathname.startsWith("/api/")) {
        return NextResponse.next({ request });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !isPublicPath(pathname) && !pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && (pathname === "/login" || pathname === "/signup")) {
      const mustChange = user.user_metadata?.must_change_password === true;
      if (mustChange) {
        return NextResponse.redirect(new URL("/settings?senha=1", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (user && pathname !== "/") {
      const mustChangePassword = user.user_metadata?.must_change_password === true;

      if (mustChangePassword) {
        const allowed = ["/settings", "/auth/callback", "/api/profile"];
        if (!allowed.some((p) => pathname.startsWith(p))) {
          return NextResponse.redirect(new URL("/settings?senha=1", request.url));
        }
        return supabaseResponse;
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .single();

      const isActive = subscription?.status === "active" || subscription?.status === "trialing";
      const allowedWithoutSub = ["/subscribe", "/auth/callback", "/settings"];

      if (!isActive && !allowedWithoutSub.some((p) => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/subscribe", request.url));
      }

      if (isActive && pathname === "/subscribe") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (!profile?.onboarding_completed) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (isActive && !allowedWithoutSub.includes(pathname)) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (!profile?.onboarding_completed && pathname !== "/onboarding" && !pathname.startsWith("/api/")) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);
    if (isPublicPath(pathname) || pathname.startsWith("/api/stripe/")) {
      return NextResponse.next({ request });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }
}

function isDemoRequest(request: NextRequest): boolean {
  return isDemoEnabled() && request.cookies.get(DEMO_COOKIE)?.value === "1";
}

export { isDemoRequest };
