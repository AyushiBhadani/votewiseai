import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Google Analytics 4 Measurement ID
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VoteWise AI — Your Personal Election Guide",
    template: "%s | VoteWise AI",
  },
  description:
    "AI-powered election guide supporting 13 countries and 16 languages. " +
    "Check your eligibility, register to vote, explore election history, " +
    "and get answers in your native language with Story Mode for kids.",
  keywords: [
    "election guide", "voter registration", "AI election assistant",
    "India elections", "voting eligibility", "multilingual voting guide",
    "Gemini AI", "election calendar", "how to vote", "VoteWise",
  ],
  authors: [{ name: "VoteWise AI" }],
  creator: "VoteWise AI",
  metadataBase: new URL("https://votewiseai-543702534688.asia-south1.run.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://votewiseai-543702534688.asia-south1.run.app",
    title: "VoteWise AI — Your Personal Election Guide",
    description:
      "Understand elections, check voter eligibility, and get AI-powered answers in 16 languages.",
    siteName: "VoteWise AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoteWise AI — Your Personal Election Guide",
    description: "AI-powered election guide for 13 countries in 16 languages.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning // safe: body-only mismatch from theme init
    >
      <head>
        <meta name="theme-color" content="#050b14" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Google Analytics GA4 — only loads when GA_ID is set */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#050b14]">
        {children}
      </body>
    </html>
  );
}
