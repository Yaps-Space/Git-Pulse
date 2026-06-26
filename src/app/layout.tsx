import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "@/shared/providers/SessionProvider"
import { Geist } from "next/font/google"
import { cn } from "@/shared/lib/utils"
import { Toaster } from "sonner"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "GitPulse",
  description: "Platform Analisis Kinerja Repository GitHub",
  icons: {
    icon: "/logo.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}