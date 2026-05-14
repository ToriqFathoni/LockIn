"use client";

import type { ReactNode } from "react";
import { Navbar } from "./pages";

export function FreelanceHubShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-slate-50">
      <Navbar />
      <main className="flex-1 mt-20">{children}</main>
    </div>
  );
}