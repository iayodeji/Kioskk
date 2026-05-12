import type { Metadata } from "next";
import "./globals.css";
import AdminGesture from "@/components/admin-gesture";

export const metadata: Metadata = {
  title: "kioskk.me",
  description: "AI-powered micro-business storefront generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AdminGesture />
        {children}
      </body>
    </html>
  );
}
