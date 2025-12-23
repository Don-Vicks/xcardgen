import { AuthInitializer } from "@/components/auth-initializer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://xcardgen.com"),
  title: {
    default: "xCardGen - Digital Event Cards",
    template: "%s | xCardGen"
  },
  description: "Create stunning digital cards for your events, workshops, and communities. Generate, customize, and share professional event assets in seconds.",
  keywords: ["event cards", "digital badge", "ticket generator", "conference badge", "social share cards", "event branding"],
  authors: [{ name: "xCardGen Team" }],
  creator: "xCardGen",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "xCardGen - Create Digital Event Cards",
    description: "Generate professional digital cards for your events automatically. Custom templates, bulk generation, and instant sharing.",
    siteName: "xCardGen",
  },
  twitter: {
    card: "summary_large_image",
    title: "xCardGen",
    description: "Create stunning digital cards for your events in seconds.",
    creator: "@xcardgen",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${spaceGrotesk.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthInitializer />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
