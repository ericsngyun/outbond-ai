import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outbond.ai - Personalize 100 cold emails in 10 minutes",
  description:
    "AI-powered SDR personalization platform for agencies and SMB SaaS doing outbound",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
