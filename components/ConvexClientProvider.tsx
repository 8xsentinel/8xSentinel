"use client";

import React, { ReactNode } from "react";

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
