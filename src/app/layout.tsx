import type { Metadata } from "next";
import "./globals.css";
import AdminGesture from "@/components/admin-gesture";

export const metadata: Metadata = {
  title: "kioskk.me | Your store in 60 seconds",
  description: "AI storefronts for campus vendors and small business owners.",
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
