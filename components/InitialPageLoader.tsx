"use client";

import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, Cpu, Wifi, Lock } from "lucide-react";

export default function InitialPageLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [fadeState, setFadeState] = useState<"visible" | "fading" | "hidden">("visible");

  const statusMessages = [
    { text: "ESTABLISHING SECURE PROTOCOL...", log: "[ BOOT ] INITIALIZING 8xSENTINEL SECURITY SYSTEM" },
    { text: "SYNCING CENTRAL BLACKLIST REGISTRY...", log: "[ SYNC ] DOWNLOADING SCAMMER ENTITY DATABASE" },
    { text: "AUDITING VERIFIED RESELLER NETWORK...", log: "[ AUDIT ] REGIONAL ADMIN ESCROW NODES VERIFIED" },
    { text: "CALIBRATING TRUST SCORING HEURISTICS...", log: "[ ALG ] NEURAL REPUTATION ENGINE ENGAGED" },
    { text: "CENTRAL SECURITY GRID ACTIVE", log: "[ READY ] DEFENSE BARRIER 100% OPERATIONAL" }
  ];

  useEffect(() => {
    // Only show loader once per session
    const hasLoaded = sessionStorage.getItem("8x_sentinel_initialized");
    if (hasLoaded) {
      setLoading(false);
      setFadeState("hidden");
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeState("fading");
            setTimeout(() => {
              setLoading(false);
              setFadeState("hidden");
              sessionStorage.setItem("8x_sentinel_initialized", "true");
            }, 600);
          }, 400);
          return 100;
        }

        const increment = Math.floor(Math.random() * 14) + 6;
        const nextProgress = Math.min(prev + increment, 100);

        const currentStep = Math.floor((nextProgress / 100) * (statusMessages.length - 1));
        setStatusIndex(currentStep);

        if (statusMessages[currentStep]) {
          setTerminalLogs((logs) => {
            const currentLog = statusMessages[currentStep].log;
            if (!logs.includes(currentLog)) {
              return [...logs, currentLog].slice(-3);
            }
            return logs;
          });
        }

        return nextProgress;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  if (!loading || fadeState === "hidden") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "#080a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
        transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: fadeState === "fading" ? 0 : 1,
        transform: fadeState === "fading" ? "scale(1.04)" : "scale(1)",
        pointerEvents: fadeState === "fading" ? "none" : "auto"
      }}
    >
      {/* Background Grid & Ambience */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(6, 182, 212, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "450px",
          height: "450px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.04) 50%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          animation: "ambientPulse 4s ease-in-out infinite alternate"
        }}
      />

      {/* Main Tactical Card Container */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "90%",
          maxWidth: "460px",
          textAlign: "center"
        }}
      >
        {/* Glowing Shield Emblem */}
        <div style={{ position: "relative", marginBottom: "30px" }}>
          <div
            style={{
              position: "absolute",
              inset: "-12px",
              borderRadius: "50%",
              border: "1px dashed rgba(6, 182, 212, 0.4)",
              animation: "spinRing 12s linear infinite"
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "-22px",
              borderRadius: "50%",
              border: "1px dotted rgba(59, 130, 246, 0.25)",
              animation: "spinRingReverse 18s linear infinite"
            }}
          />
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.05))",
              border: "1px solid rgba(6, 182, 212, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(6, 182, 212, 0.25)"
            }}
          >
            <Shield className="w-9 h-9 text-accent-cyan" />
          </div>
        </div>

        {/* Brand Titles */}
        <h2
          style={{
            fontFamily: "var(--font-h)",
            fontSize: "26px",
            fontWeight: 900,
            letterSpacing: "3px",
            textTransform: "uppercase",
            margin: "0 0 6px 0",
            color: "#fff"
          }}
        >
          8X<span className="g">SENTINEL</span>
        </h2>

        <p
          style={{
            fontFamily: "var(--font-h)",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--color-muted)",
            letterSpacing: "4px",
            textTransform: "uppercase",
            marginBottom: "36px"
          }}
        >
          DEFI TRUST &amp; SECURITY INFRASTRUCTURE
        </p>

        {/* HUD Indicator Details */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "8px",
            padding: "0 2px"
          }}
        >
          <div style={{ textAlign: "left" }}>
            <span
              style={{
                fontFamily: "var(--font-h)",
                fontSize: "10px",
                fontWeight: 700,
                color: "#06b6d4",
                letterSpacing: "1.5px",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <Wifi size={10} /> SECURITY INITIALIZATION
            </span>
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-h)",
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.5px",
                marginTop: "2px"
              }}
            >
              {statusMessages[statusIndex]?.text || "BOOTING SECURE ENVIRONMENT..."}
            </span>
          </div>

          <div
            style={{
              fontFamily: "var(--font-h)",
              fontSize: "24px",
              fontWeight: 900,
              color: "#06b6d4",
              letterSpacing: "0.5px",
              lineHeight: 1,
              textShadow: "0 0 10px rgba(6, 182, 212, 0.5)"
            }}
          >
            {progress}%
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "12px",
            background: "rgba(14, 17, 24, 0.8)",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            borderRadius: "6px",
            padding: "2px",
            boxShadow: "inset 0 2px 5px rgba(0,0,0,0.8), 0 0 15px rgba(6, 182, 212, 0.05)",
            position: "relative",
            overflow: "hidden",
            marginBottom: "28px"
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: "3px",
              background: "linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)",
              boxShadow: "0 0 10px rgba(6, 182, 212, 0.6), 0 0 20px rgba(59, 130, 246, 0.4)",
              transition: "width 0.15s cubic-bezier(0.1, 0.8, 0.2, 1)",
              position: "relative",
              overflow: "hidden"
            }}
          />
        </div>

        {/* Tactical Sub-Terminal Log Output */}
        <div
          style={{
            width: "100%",
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "10px",
            padding: "12px 18px",
            textAlign: "left",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "6px",
              marginBottom: "8px"
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-h)",
                fontSize: "9px",
                fontWeight: 700,
                color: "var(--color-muted)",
                letterSpacing: "1px"
              }}
            >
              CONSOLE OUTPUT LOGS
            </span>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: progress >= 100 ? "#22c55e" : "#06b6d4",
                boxShadow: `0 0 8px ${progress >= 100 ? "#22c55e" : "#06b6d4"}`,
                animation: "blink 1s infinite alternate"
              }}
            />
          </div>

          <div
            style={{
              fontFamily: "monospace",
              fontSize: "10px",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.6,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              minHeight: "52px"
            }}
          >
            {terminalLogs.length === 0 ? (
              <div style={{ color: "rgba(6, 182, 212, 0.7)" }}>[ BOOT ] SECURITY ENGINES CONNECTED.</div>
            ) : (
              terminalLogs.map((log, index) => {
                let color = "rgba(255,255,255,0.5)";
                if (log.includes("[ READY ]")) color = "rgba(34, 197, 94, 0.9)";
                else if (log.includes("[ BOOT ]")) color = "rgba(6, 182, 212, 0.8)";
                
                return (
                  <div key={index} style={{ color }}>
                    {log}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spinRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinRingReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes ambientPulse {
          0% { transform: scale(0.95); opacity: 0.7; }
          100% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes blink {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
