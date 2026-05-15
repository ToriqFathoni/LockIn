"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "./pages";

export function FreelanceHubShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user && pathname !== "/") {
      router.replace("/login");
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading && pathname !== "/") {
    return null;
  }

  if (!user && pathname !== "/") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-slate-50">
      <Navbar />
      <main className="flex-1 mt-20">{children}</main>
    </div>
  );
}