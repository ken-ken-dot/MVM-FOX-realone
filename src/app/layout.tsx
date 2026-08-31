import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MVM FOX — Multi-Service Business Platform",
    template: "%s | MVM FOX",
  },
  description:
    "Premium catering, products, and professional services from MVM FOX. A multi-service business platform.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://mvmfox.com",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MVM FOX",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
