"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ShoppingBag, MessageCircle, User, ShieldAlert, Store } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-indigo-600 scale-110" : "text-slate-400 hover:text-slate-600"
      )}
    >
      <div className={cn("transition-transform", active ? "mb-0.5" : "")}>
        <Icon size={24} strokeWidth={active ? 2.5 : 2} aria-hidden={true} />
      </div>
      <span
        className={cn(
          "text-[10px] font-bold tracking-wide uppercase",
          active ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      >
        {label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { userRole } = useApp();
  const { t } = useLang();

  // Hide bottom nav on publish and product detail pages (immersive views)
  if (pathname.startsWith("/publish") || pathname.startsWith("/product")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-3 flex items-center justify-between z-30 pb-safe"
      aria-label="Navegación principal"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <NavItem
        href="/"
        icon={LayoutGrid}
        label={t.nav.market}
        active={pathname === "/"}
      />
      <NavItem
        href="/purchases"
        icon={ShoppingBag}
        label={t.nav.purchases}
        active={pathname === "/purchases"}
      />
      <NavItem
        href="/seller"
        icon={Store}
        label={t.nav.sell}
        active={pathname === "/seller"}
      />
      <NavItem
        href="/chat"
        icon={MessageCircle}
        label={t.nav.chat}
        active={pathname.startsWith("/chat")}
      />
      {userRole === "admin" ? (
        <NavItem
          href="/admin"
          icon={ShieldAlert}
          label={t.nav.admin}
          active={pathname === "/admin"}
        />
      ) : (
        <NavItem
          href="/profile"
          icon={User}
          label={t.nav.profile}
          active={pathname === "/profile"}
        />
      )}
    </nav>
  );
}
