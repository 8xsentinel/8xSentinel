"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Search,
  FileSpreadsheet,
  Users,
  Menu,
  X,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  ArrowRightLeft,
} from "lucide-react";
import AuthButton from "../auth/AuthButton";
import { useAuth } from "../../lib/firebase/AuthContext";
import { db } from "../../lib/db";
import { Profile } from "../../types";
import { toast } from "sonner";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserProfile(user ? db.getCurrentUser() : null);
  }, [user, pathname]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setRoleDropdownOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Reset mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRoleChange = (role: "user" | "verified_reseller" | "regional_admin" | "admin") => {
    const updated = db.setCurrentUser(role);
    setUserProfile(updated);
    setRoleDropdownOpen(false);
    toast.success(`Access Clearance Updated: ${role.toUpperCase()}`, {
      description: "System privileges updated for this session.",
    });
  };

  const navLinks = [
    { label: "Registry Lookup", href: "/search", icon: Search },
    { label: "File Report", href: "/submit-report", icon: FileSpreadsheet },
    { label: "Verified Resellers", href: "/resellers", icon: Users },
  ];

  const isMod =
    userProfile?.role === "regional_admin" ||
    userProfile?.role === "admin";

  const deskLinkStyle =
    "text-gray-300 hover:text-white font-sans text-[13.5px] font-medium tracking-wide px-3.5 py-2 transition-all duration-200 inline-flex items-center gap-1.5 rounded-lg hover:bg-white/5";
  const activeLinkStyle = "text-accent-cyan bg-accent-cyan/10 font-semibold border-b-2 border-accent-cyan";

  return (
    <>
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-300"
        style={{
          background:
            scrolled || mobileOpen
              ? "rgba(8, 10, 15, 0.95)"
              : "rgba(8, 10, 15, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom:
            scrolled || mobileOpen
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid rgba(255, 255, 255, 0.04)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="relative flex items-center justify-center">
                <Shield className="w-7 h-7 text-accent-cyan transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-accent-cyan/20 blur-md rounded-full -z-10 animate-pulse" />
              </div>
              <span
                className="font-bold text-xl tracking-wider uppercase text-white"
                style={{ fontFamily: "var(--font-h)" }}
              >
                8x<span className="g">SENTINEL</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${deskLinkStyle} ${
                      isActive ? activeLinkStyle : ""
                    }`}
                  >
                    <Icon className="w-4 h-4 text-accent-cyan opacity-80" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {user && isMod && (
                <Link
                  href="/admin"
                  className={`${deskLinkStyle} ${
                    pathname.startsWith("/admin")
                      ? "text-accent-purple bg-accent-purple/10 border-b-2 border-accent-purple"
                      : "text-accent-purple hover:bg-accent-purple/5"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-accent-purple animate-pulse" />
                  <span>Command Deck</span>
                </Link>
              )}
            </nav>

            {/* Right Actions & Auth */}
            <div className="hidden lg:flex items-center gap-4">
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-accent-cyan/40 text-[11px] font-mono text-gray-300 transition-all select-none"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-accent-cyan" />
                    <span>
                      Clearance:{" "}
                      <span className="font-bold text-accent-cyan uppercase">
                        {userProfile?.role || "Operator"}
                      </span>
                    </span>
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 glass-panel rounded-xl border border-white/10 shadow-2xl py-2 z-50 font-mono text-xs">
                      <div className="px-4 py-2 border-b border-white/5 text-[10px] text-text-muted uppercase tracking-widest font-bold">
                        Clearance Override
                      </div>
                      <button
                        onClick={() => handleRoleChange("admin")}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-accent-purple font-bold flex items-center justify-between"
                      >
                        <span>ADMIN DECK</span>
                        {userProfile?.role === "admin" && (
                          <span className="text-accent-purple">✓</span>
                        )}
                      </button>
                      <button
                        onClick={() => handleRoleChange("regional_admin")}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-accent-cyan font-bold flex items-center justify-between"
                      >
                        <span>REGIONAL ADMIN</span>
                        {userProfile?.role === "regional_admin" && (
                          <span className="text-accent-cyan">✓</span>
                        )}
                      </button>
                      <button
                        onClick={() => handleRoleChange("verified_reseller")}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-accent-amber font-bold flex items-center justify-between"
                      >
                        <span>VERIFIED RESELLER</span>
                        {userProfile?.role === "verified_reseller" && (
                          <span className="text-accent-amber">✓</span>
                        )}
                      </button>
                      <button
                        onClick={() => handleRoleChange("user")}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-accent-green font-bold flex items-center justify-between"
                      >
                        <span>STANDARD USER</span>
                        {userProfile?.role === "user" && (
                          <span className="text-accent-green">✓</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <AuthButton />
            </div>

            {/* Mobile Menu Trigger */}
            <div className="lg:hidden flex items-center gap-3">
              <AuthButton />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Panel */}
      <div
        className={`ag-nav-mobile ag-drawer-container lg:hidden fixed inset-0 z-[9999] layer-overlay transition-all duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        <div
          ref={drawerRef}
          className={`ag-drawer fixed top-0 right-0 bottom-0 w-[85%] sm:w-[340px] bg-[#080a0f]/95 backdrop-blur-2xl border-l border-white/10 z-[9999] overflow-y-auto px-6 py-6 transition-transform duration-300 ease-out flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)] ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col gap-4">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-2">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Shield className="w-6 h-6 text-accent-cyan" />
                <span
                  className="font-bold text-lg tracking-wider uppercase text-white"
                  style={{ fontFamily: "var(--font-h)" }}
                >
                  8x<span className="g">SENTINEL</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${
                      isActive
                        ? "text-accent-cyan bg-accent-cyan/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                    style={{ fontFamily: "var(--font-h)" }}
                  >
                    <Icon className="w-4 h-4 text-accent-cyan" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {user && isMod && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-semibold text-accent-purple hover:bg-accent-purple/10 transition-colors"
                  style={{ fontFamily: "var(--font-h)" }}
                >
                  <ShieldAlert className="w-4 h-4 text-accent-purple" />
                  <span>Command Deck</span>
                </Link>
              )}
            </div>

            {/* Clearance selector for mobile */}
            {user && (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <span
                  className="text-[10px] text-text-muted uppercase tracking-widest font-bold block"
                  style={{ fontFamily: "var(--font-h)" }}
                >
                  Clearance Role
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleRoleChange("admin")}
                    className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                      userProfile?.role === "admin"
                        ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/40"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => handleRoleChange("regional_admin")}
                    className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                      userProfile?.role === "regional_admin"
                        ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Reg. Admin
                  </button>
                  <button
                    onClick={() => handleRoleChange("verified_reseller")}
                    className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                      userProfile?.role === "verified_reseller"
                        ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/40"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Reseller
                  </button>
                  <button
                    onClick={() => handleRoleChange("user")}
                    className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                      userProfile?.role === "user"
                        ? "bg-accent-green/20 text-accent-green border border-accent-green/40"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    User
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="pt-6 border-t border-white/10 text-center">
            <p className="text-[11px] text-text-muted">
              8xSentinel Security Protocol v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
