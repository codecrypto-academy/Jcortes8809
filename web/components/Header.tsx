"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@/components/ConnectButton";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useWeb3 } from "@/contexts/Web3Context";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserStatusBadge } from "@/components/UserStatusBadge";
import { ROLE_EMOJIS } from "@/lib/constants";
import { UserStatus } from "@/types";
import { Package2 } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { isConnected, userInfo, isAdmin } = useWeb3();
  const { t } = useLanguage();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/dashboard", label: t("nav.dashboard"), requiresAuth: true },
    { href: "/tokens", label: t("nav.tokens"), requiresAuth: true, adminOnly: false },
    { href: "/transfers", label: t("nav.transfers"), requiresAuth: true, adminOnly: false },
    { href: "/profile", label: t("nav.profile"), requiresAuth: true },
  ];

  const visibleLinks = navLinks.filter(link => {
    if (!link.requiresAuth) return true;
    if (!isConnected || !userInfo || userInfo.status !== UserStatus.Approved) return false;
    if (link.adminOnly === true && !isAdmin) return false;
    if (link.adminOnly === false && isAdmin) return false;
    // Permitir que Retailer vea la opción de tokens
    return true;
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">Supply Chain Tracker</span>
            <span className="sm:hidden">SCT</span>
          </Link>

          {visibleLinks.length > 0 && (
            <nav className="hidden md:flex items-center gap-4">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.href) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {isConnected && userInfo && (
            <div className="flex items-center gap-2">
              <span className="text-sm hidden lg:inline">
                {ROLE_EMOJIS[userInfo.role as keyof typeof ROLE_EMOJIS]} {userInfo.role}
              </span>
              <UserStatusBadge status={userInfo.status} />
            </div>
          )}
          <ThemeToggle />
          <LanguageSelector />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
