import type { Metadata } from "next";
import localFont from "next/font/local";
import { FirebaseAuthProvider } from "../lib/firebase/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SocialFloat from "../components/SocialFloat";
import InitialPageLoader from "../components/InitialPageLoader";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://8xsentinel.com"),
  title: {
    default: "8xSentinel — BGMI Central Scammer Registry & Trader Verification Network",
    template: "%s | 8xSentinel",
  },
  description:
    "The definitive trust protocol for the BGMI account trading ecosystem. Search phone numbers, Telegram IDs, UPI IDs, and verified reseller profiles before transacting.",
  keywords: [
    "BGMI scammer registry",
    "BGMI account trust check",
    "BGMI trusted seller list",
    "BGMI verified resellers",
    "BGMI trade safety",
    "8x Sentinel",
    "check BGMI scammer",
    "BGMI UPI blacklist",
    "BGMI telegram verification",
  ],
  openGraph: {
    title: "8xSentinel — BGMI Central Scammer Registry & Reseller Verification",
    description:
      "Definitive trust infrastructure built by Resellers for all Resellers in the BGMI community. Check blacklists and find verified BGMI stores before dealing.",
    url: "https://8xsentinel.com",
    siteName: "8xSentinel",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "8xSentinel — BGMI Trading Security Protocol",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "8xSentinel — BGMI Reseller Community Security Platform",
    description:
      "Definitive trust infrastructure built by Resellers for all Resellers in the BGMI community. Check blacklists and find verified BGMI stores before dealing.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark font-sans">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#080a0f] text-[#eaeaea] min-h-screen flex flex-col`}
      >
        <FirebaseAuthProvider>
          <InitialPageLoader />
          <Navbar />
          <div className="pt-[68px] min-h-[calc(100vh-68px)] flex flex-col justify-between flex-1">
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <SocialFloat />
          <Toaster position="bottom-right" theme="dark" closeButton />
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
