import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SpeedInsights } from "@vercel/speed-insights/next"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const baseUrl = process.env.NODE_ENV === 'production' ? 'https://gawa-tara-ctcc.vercel.app' : 'http://localhost:3000'



export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: "Gawa Tara? | Task Management",
  description: "Rooted warmth for your daily tasks.",

  openGraph: {
    title: "Gawa Tara? | Task Management",
    description: "Rooted warmth for your daily tasks.",
    url: baseUrl,
    siteName: "Gawa Tara?",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Grow your habits, achieve your goals",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Gawa Tara? | Task Management",
    description: "Rooted warmth for your daily tasks.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
}

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        playfair.variable,
        manrope.variable,
        "font-body"
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

