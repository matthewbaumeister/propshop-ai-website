import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Prop Shop AI - AI-Powered Property Management Solutions",
  description: "Professional B2B property management tools powered by AI. Streamline your property operations with intelligent automation and analytics.",
  keywords: "property management, AI, B2B, real estate, automation, analytics",
  authors: [{ name: "Prop Shop AI" }],
  openGraph: {
    title: "Prop Shop AI - AI-Powered Property Management",
    description: "Professional B2B property management tools powered by AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
