import type { Metadata } from "next";
import { Rajdhani, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "8x Sentinel - BGMI Account Trading Security Platform",
  description: "The definitive trust infrastructure for the BGMI account trading ecosystem - community-powered scammer registry, reseller verification network, and reputation intelligence.",
  keywords: ["BGMI", "BGMI Trade", "Scammer Registry", "BGMI Trusted Seller", "Esports Security", "8x Sentinel"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${rajdhani.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-body bg-bg-void text-text-primary antialiased min-h-screen flex flex-col`}
      >
        <div className="flex-1 flex flex-col relative">
          {children}
        </div>
        <Toaster position="bottom-right" theme="dark" closeButton />
      </body>
    </html>
  );
}
