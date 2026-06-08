"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  Shield,
  Search,
  FileSpreadsheet,
  Users,
  Menu,
  X,
  ShieldAlert,
  LayoutDashboard,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user: clerkUser, isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = clerkUser?.publicMetadata?.role as string | undefined;
  const isAdmin = userRole === "community_admin" || userRole === "chief_admin";

  const navLinks = [
    { label: "Verify Identity", href: "/verify-identity", icon: Search },
    { label: "Directory", href: "/resellers", icon: Users },
    { label: "Report Scam", href: "/file-report", icon: FileSpreadsheet },
  ];

  const displayName =
    clerkUser?.fullName ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    "User";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">8xSentinel</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    link.href === "/file-report"
                      ? "text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      : isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right-side actions */}
        <div className="hidden md:flex items-center gap-3">
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-destructive" />
                Admin
              </Link>
            )}
            <div className="flex items-center gap-2 border-l pl-3">
              <UserButton />
            </div>
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 border border-input bg-background">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                Get Started
              </button>
            </SignUpButton>
          </Show>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
          <Show when="signed-in">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                Admin Console
              </Link>
            )}
          </Show>
          <Show when="signed-out">
            <div className="flex gap-2 pt-2 border-t">
              <SignInButton mode="modal">
                <button className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="flex-1 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          </Show>
        </div>
      )}
    </nav>
  );
}
