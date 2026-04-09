import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "@/shared/providers/SessionProvider"

export const metadata: Metadata = {
  title: "GitPulse",
  description: "Platform Analisis Kinerja Repository GitHub",
   icons: {
    icon: "/logo.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}