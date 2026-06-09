"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, LayoutDashboard, BookOpen, MessageCircle, LogOut, Settings, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const nav = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/plano", label: "Plano", icon: UtensilsCrossed },
  { href: "/diary", label: "Diário", icon: BookOpen },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/settings", label: "Config", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (IS_DEMO) {
      await fetch("/api/demo/login", { method: "DELETE" });
    } else {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Leaf className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">Nutri IA</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("gap-2", pathname === item.href && "bg-secondary")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex border-t border-border/60 sm:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
