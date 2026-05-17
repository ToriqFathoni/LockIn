import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "LockIn",
  description: "Modern freelance marketplace prototype built with Next.js and Tailwind CSS.",
  icons: {
    icon: "/Logos/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased overflow-x-hidden">
      <body className="min-h-full flex flex-col bg-slate-50 overflow-x-hidden">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pt-14 flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
