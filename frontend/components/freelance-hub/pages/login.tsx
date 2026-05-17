"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors } from "../data";
import { Button } from "../ui";
import { useAuth } from "@/context/AuthContext";

export const LoginPage = () => {
  const router = useRouter();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal. Periksa kembali email dan password Anda.");
        return;
      }
      login(data.token, data.user);
      router.push("/home");
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 animate-fade-in">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob pointer-events-none" style={{ backgroundColor: colors.secondary }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <button type="button" onClick={() => router.push("/")} className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transform group-hover:rotate-12 transition-transform" style={{ background: `linear-gradient(135deg, ${colors.primary}, #60a5fa)` }}>
              <span className="text-white font-black text-2xl">F</span>
            </div>
            <span className="font-extrabold text-3xl tracking-tight" style={{ color: colors.textMain }}>
              Lock<span style={{ color: colors.primary }}>In</span>
            </span>
          </button>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Selamat datang kembali</h1>
          <p className="text-slate-500 text-sm">Masuk untuk melanjutkan ke akun Anda</p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] border border-slate-100 p-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="nama@email.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all"
                style={{ "--tw-ring-color": colors.primary } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Masukkan password Anda"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all"
                style={{ "--tw-ring-color": colors.primary } as React.CSSProperties}
              />
            </div>

            <Button
              id="login-submit"
              type="submit"
              variant="primary"
              className="w-full mt-2"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="font-bold transition-colors hover:underline"
                style={{ color: colors.primary }}
              >
                Daftar sekarang
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
