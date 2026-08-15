"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Search,
  FileSpreadsheet,
  Users,
  Eye,
  Heart,
  ExternalLink,
  MessageSquare,
  Lock,
  CheckCircle,
  HelpCircle,
  Scale,
} from "lucide-react";

// Social channels data with branded colors & SVGs
const socials = [
  {
    href: "https://wa.me",
    color: "#25D366",
    bg: "rgba(37,211,102,0.12)",
    border: "rgba(37,211,102,0.3)",
    label: "WhatsApp",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    href: "https://t.me",
    color: "#229ED9",
    bg: "rgba(34,158,217,0.12)",
    border: "rgba(34,158,217,0.3)",
    label: "Telegram",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    href: "https://instagram.com",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.12)",
    border: "rgba(225,48,108,0.3)",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    href: "mailto:8xsentinel@gmail.com",
    color: "#EA4335",
    bg: "rgba(234,67,53,0.12)",
    border: "rgba(234,67,53,0.3)",
    label: "Email",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [views, setViews] = useState<number>(14820);

  useEffect(() => {
    const cached = localStorage.getItem("8x_views");
    if (cached) {
      setViews(Number(cached) + 1);
      localStorage.setItem("8x_views", String(Number(cached) + 1));
    } else {
      localStorage.setItem("8x_views", "14820");
    }
  }, []);

  return (
    <footer
      style={{
        background: "var(--color-bg2)",
        borderTop: "1px solid rgba(6, 182, 212, 0.2)",
        padding: "60px 5% 24px",
      }}
      className="mt-auto font-sans"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "36px",
          maxWidth: "1200px",
          margin: "0 auto 40px auto",
        }}
      >
        {/* Brand Column */}
        <div style={{ maxWidth: "340px" }}>
          <div
            style={{
              fontFamily: "var(--font-h)",
              fontSize: "20px",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "1.5px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Shield className="w-5 h-5 text-accent-cyan" />
            <span>
              8X<span className="g">SENTINEL</span>
            </span>
          </div>
          <p
            style={{
              color: "var(--color-muted)",
              fontSize: "13px",
              lineHeight: 1.7,
              marginBottom: "20px",
            }}
          >
            Central trust infrastructure and blacklist registry for the BGMI
            trading ecosystem. Community-verified, moderator approved.
          </p>

          {/* Social Icons */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: s.color,
                  textDecoration: "none",
                  transition: "transform .2s, opacity .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.opacity = "0.85";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-h)",
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--color-cyan)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Registry &amp; Search
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { to: "/search", label: "Search Database", icon: <Search size={13} /> },
              { to: "/submit-report", label: "Submit Scam Report", icon: <FileSpreadsheet size={13} /> },
              { to: "/resellers", label: "Verified Resellers", icon: <Users size={13} /> },
              { to: "/apply-verification", label: "Apply for Verification", icon: <CheckCircle size={13} /> },
            ].map((l) => (
              <Link
                key={l.to}
                href={l.to}
                style={{
                  color: "var(--color-muted)",
                  fontSize: "13px",
                  textDecoration: "none",
                  transition: "color .2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--color-muted)")
                }
              >
                <span
                  style={{
                    color: "var(--color-cyan)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {l.icon}
                </span>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Security & Community */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-h)",
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--color-cyan)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Security &amp; Policy
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { to: "/about", label: "About Sentinel", icon: <Shield size={13} /> },
              { to: "/search", label: "Scammer Blacklist", icon: <Lock size={13} /> },
              { to: "/resellers", label: "Trust Guidelines", icon: <Scale size={13} /> },
            ].map((l) => (
              <Link
                key={l.to}
                href={l.to}
                style={{
                  color: "var(--color-muted)",
                  fontSize: "13px",
                  textDecoration: "none",
                  transition: "color .2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--color-muted)")
                }
              >
                <span
                  style={{
                    color: "var(--color-cyan)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {l.icon}
                </span>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-h)",
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--color-cyan)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Emergency Contact
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            <a
              href="mailto:8xsentinel@gmail.com"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                color: "var(--color-muted)",
                fontSize: "13px",
                textDecoration: "none",
                transition: "color .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-muted)")
              }
            >
              <span style={{ color: "#EA4335", display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
              </span>
              8xsentinel@gmail.com
            </a>
            <div
              style={{
                background: "rgba(6, 182, 212, 0.05)",
                border: "1px solid rgba(6, 182, 212, 0.2)",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "11px",
                color: "var(--color-muted)",
                marginTop: "6px",
              }}
            >
              <span style={{ color: "#06b6d4", fontWeight: 700 }}>24/7 Monitoring:</span>{" "}
              Moderators actively review reports across all regional timezones.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          paddingTop: "20px",
          textAlign: "center",
          fontSize: "12px",
          color: "var(--color-muted)",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Sleek View Counter Badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(6, 182, 212, 0.04)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              borderRadius: "20px",
              padding: "6px 16px",
              fontSize: "12px",
              color: "var(--color-cyan)",
              fontWeight: 600,
              letterSpacing: "0.5px",
              boxShadow: "0 0 20px rgba(6, 182, 212, 0.05)",
              backdropFilter: "blur(4px)",
              transition: "transform 0.3s ease, border-color 0.3s ease",
            }}
          >
            <Eye
              size={13}
              style={{
                filter: "drop-shadow(0 0 2px rgba(6, 182, 212, 0.6))",
                color: "#06b6d4",
              }}
            />
            <span>TOTAL REGISTRY LOOKUPS:</span>
            <span
              style={{
                color: "#fff",
                fontFamily: "var(--font-h)",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              {views.toLocaleString()}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "4px 8px",
            fontSize: "11px",
            lineHeight: 1.8,
          }}
        >
          <span>
            Crafted with{" "}
            <Heart
              size={11}
              fill="#ef4444"
              color="#ef4444"
              style={{ display: "inline", verticalAlign: "middle", margin: "0 2px" }}
            />{" "}
            for the BGMI Gaming Community
          </span>
          <span>·</span>
          <span>
            © {new Date().getFullYear()}{" "}
            <Link
              href="/"
              style={{
                color: "var(--color-cyan)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              8xSentinel Platform
            </Link>
          </span>
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "10px",
            color: "var(--color-muted)",
          }}
        >
          Disclaimer: 8x Sentinel is an independent community registry. Not
          affiliated with BGMI or Krafton.
        </div>
      </div>
    </footer>
  );
}
