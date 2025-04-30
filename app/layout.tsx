import type React from "react"
import "./globals.css"
import { Tomorrow } from "next/font/google"

const tomorrow = Tomorrow({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-tomorrow",
})

export const metadata = {
  title: "N.R.R.C - Nuclear Recycling Reactor Console",
  description: "Escape Room Companion for Sustainability Lab",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${tomorrow.variable} font-tomorrow`}>{children}</body>
    </html>
  )
}
