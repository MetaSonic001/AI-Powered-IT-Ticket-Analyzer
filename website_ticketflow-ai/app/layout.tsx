import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "TicketFlow AI - Transform Your IT Support with AI-Powered Intelligence",
  description:
    "Reduce resolution time by 60%, increase team productivity, and deliver exceptional IT support with our intelligent ticket analysis platform.",
  generator: "TicketFlow AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <body className="font-sans antialiased">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
      </NextThemesProvider>
    </html>
  )
}
