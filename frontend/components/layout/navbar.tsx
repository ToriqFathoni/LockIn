"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { colors } from "../freelance-hub/data";
import { IconBriefcase, IconCheckCircle, IconMessage, IconPlus, IconUser, IconMenu, IconX } from "../freelance-hub/icons";
import { Button } from "@/components/ui";

const navItems = [
  { href: "/home", label: "Find Work", icon: IconBriefcase },
  { href: "/post-job", label: "Post a Job", icon: IconPlus },
  { href: "/my-jobs", label: "My Jobs", icon: IconCheckCircle },
  { href: "/messages", label: "Messages", icon: IconMessage },
  { href: "/profile", label: "Profile", icon: IconUser },
];

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const isLanding = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/freelancer-profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => res.json())
      .then(data => {
        if (data.profile?.avatar_url) {
          setAvatarUrl(data.profile.avatar_url);
        }
      })
      .catch((err) => console.error("Failed to fetch avatar:", err));
    }
  }, [user, token, pathname]);

  const filteredNavItems = navItems;

  if (isAuthPage) return null;

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isLanding ? "bg-white py-4" : "bg-white/80 backdrop-blur-md shadow-sm py-2 border-b border-slate-100"}`}>
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-14">
        <button type="button" className="flex items-center cursor-pointer group shrink-0 text-left" onClick={() => router.push(isLanding ? "/" : "/home")}> 
          <div className="w-10 h-10 flex items-center justify-center mr-3 transform group-hover:rotate-12 transition-transform">
            <img src="/Logos/logo.png" alt="LockIn Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight hidden sm:block" style={{ color: colors.textMain }}>
            Lock<span style={{ color: colors.primary }}>In</span>
          </span>
        </button>

        {!isLanding ? (
          <div className="hidden md:flex items-center space-x-1 bg-slate-50 p-1 rounded-full border border-slate-100 flex-nowrap overflow-x-auto hide-scrollbar">
            {filteredNavItems.map((tab) => (
              <button key={tab.href} onClick={() => router.push(tab.href)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${pathname === tab.href ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"}`} style={{ color: pathname === tab.href ? colors.primary : "" }}>
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {!isLanding && (
            <button 
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <IconX /> : <IconMenu />}
            </button>
          )}
          {isLanding && !user ? (
            <>
              <Button variant="ghost" onClick={() => router.push("/login")} className="hidden sm:flex">Log In</Button>
              <Button variant="primary" onClick={() => router.push("/register")}>Sign Up</Button>
            </>
          ) : user ? (
            <div className="flex items-center gap-3">
              {isLanding && (
                <Button variant="ghost" onClick={() => router.push("/home")} className="hidden sm:flex">Find Work</Button>
              )}
              <div className="relative group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-md border-2 border-white hover:ring-2 transition-all overflow-hidden" style={{ backgroundColor: colors.primary }} onClick={() => router.push("/profile")}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-lg border border-slate-100 p-2 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <p className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{user.name}</p>
                  <button onClick={() => router.push("/profile")} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">Profile Saya</button>
                  <button onClick={() => { logout(); router.push("/"); }} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">Keluar</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.push("/login")} className="hidden sm:flex">Log In</Button>
              <Button variant="primary" onClick={() => router.push("/register")}>Sign Up</Button>
            </>
          )}
        </div>
      </div>
    </div>
    
    {isMobileMenuOpen && !isLanding && (
      <div className="md:hidden border-t border-slate-100 bg-white py-2 px-4 shadow-sm absolute w-full left-0 top-full">
        <div className="flex flex-col space-y-1">
          {filteredNavItems.map((tab) => (
            <button 
              key={tab.href} 
              onClick={() => {
                router.push(tab.href);
                setIsMobileMenuOpen(false);
              }} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${pathname === tab.href ? "bg-slate-50" : "text-slate-600 hover:bg-slate-50"}`}
              style={{ color: pathname === tab.href ? colors.primary : "" }}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    )}
    </nav>
  );
};
