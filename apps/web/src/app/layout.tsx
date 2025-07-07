import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gameitos - Card Game Leaderboard",
  description: "Track your card game scores with F1-style points and leaderboards",
  keywords: ["card games", "leaderboard", "poker", "blackjack", "points", "ranking"],
  authors: [{ name: "Gameitos Team" }],
  creator: "Gameitos",
  openGraph: {
    title: "Gameitos - Card Game Leaderboard",
    description: "Track your card game scores with F1-style points and leaderboards",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Gameitos - Card Game Leaderboard",
    description: "Track your card game scores with F1-style points and leaderboards",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
