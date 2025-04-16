"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/* eslint-disable @typescript-eslint/no-explicit-any */
export function ThemeProvider({ 
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
} 