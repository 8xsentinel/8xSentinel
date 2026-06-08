"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Only instantiate ConvexReactClient if the URL is present.
// This prevents a crash when NEXT_PUBLIC_CONVEX_URL hasn't been set yet
// (i.e. before running `npx convex dev`).
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function ConvexWithClerk({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  if (!convex) {
    // Convex not configured yet — render children without Convex context
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexWithClerk>{children}</ConvexWithClerk>
    </ClerkProvider>
  );
}
