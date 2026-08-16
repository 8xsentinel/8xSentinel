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
  Crown,
} from "lucide-react";
import AuthButton from "../auth/AuthButton";
import { useAuth } from "../../lib/firebase/AuthContext";
import { db } from "../../lib/db";
import { Profile } from "../../types";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const pathname = usePathname();
  const { user, isSuperAdmin } = useAuth();
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

  const navLinks = [
    { label: "Registry Lookup", href: "/search", icon: Search },
    { label: "File Report", href: "/submit-report", icon: FileSpreadsheet },
    { label: "Verified Resellers", href: "/resellers", icon: Users },
  ];

  const canAccessAdmin = isSuperAdmin || userProfile?.role === "regional_admin";

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

              {user && canAccessAdmin && (
                <Link
                  href="/admin"
                  className={`${deskLinkStyle} ${
                    pathname.startsWith("/admin")
                      ? isSuperAdmin
                        ? "text-accent-red bg-accent-red/10 border-b-2 border-accent-red"
                        : "text-accent-purple bg-accent-purple/10 border-b-2 border-accent-purple"
                      : isSuperAdmin
                      ? "text-accent-red hover:bg-accent-red/5"
                      : "text-accent-purple hover:bg-accent-purple/5"
                  }`}
                >
                  {isSuperAdmin ? (
                    <Crown className="w-4 h-4 text-accent-red animate-pulse" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-accent-purple animate-pulse" />
                  )}
                  <span>{isSuperAdmin ? "Super Admin Deck" : "Command Deck"}</span>
                </Link>
              )}
            </nav>

            {/* Right Actions & Auth */}
            <div className="hidden lg:flex items-center gap-4">


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
          className={`ag-drawer fixed top-0 right-0 bottom-0 w-[85%] sm:w-[340px] bg-[#080a0f]/95 backdrop-blur-2xl border-l border-white/10 z-[9999] overflow-y-auto px-6 pt-6 pb-12 sm:pb-6 transition-transform duration-300 ease-out flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)] ${
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

              {user && canAccessAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${
                    isSuperAdmin
                      ? "text-accent-red hover:bg-accent-red/10"
                      : "text-accent-purple hover:bg-accent-purple/10"
                  }`}
                  style={{ fontFamily: "var(--font-h)" }}
                >
                  {isSuperAdmin ? (
                    <Crown className="w-4 h-4 text-accent-red" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-accent-purple" />
                  )}
                  <span>{isSuperAdmin ? "Super Admin Deck" : "Command Deck"}</span>
                </Link>
              )}
            </div>


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
