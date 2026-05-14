"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors } from "../data";
import { Button } from "../ui";
import { useAuth } from "@/context/AuthContext";

type RoleType = "freelancer" | "client";

export const RegisterPage = () => {
  const router = useRouter();
  const { user, login } = useAuth();
  const [role, setRole] = useState<RoleType>("freelancer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password harus minimal 8 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role,
          phone: form.phone || null,
          location: form.location || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registrasi gagal. Coba lagi.");
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob pointer-events-none" style={{ backgroundColor: colors.primary }} />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <button type="button" onClick={() => router.push("/")} className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transform group-hover:rotate-12 transition-transform" style={{ background: `linear-gradient(135deg, ${colors.primary}, #60a5fa)` }}>
              <span className="text-white font-black text-2xl">F</span>
            </div>
            <span className="font-extrabold text-3xl tracking-tight" style={{ color: colors.textMain }}>
              Lock<span style={{ color: colors.primary }}>In</span>
            </span>
          </button>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Buat akun baru</h1>
          <p className="text-slate-500 text-sm">Bergabung dengan ribuan profesional di LockIn</p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] border border-slate-100 p-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-bold text-slate-700 mb-3">Saya bergabung sebagai</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="role-worker"
                type="button"
                onClick={() => setRole("freelancer")}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${role === "freelancer" ? "border-[#8cbbed] bg-blue-50/50" : "border-slate-200 hover:border-slate-300 bg-slate-50"}`}
              >
                <span className="text-2xl mb-2 block">💼</span>
                <p className="font-bold text-slate-800 text-sm">Freelancer</p>
                <p className="text-xs text-slate-500 mt-0.5">Saya ingin mencari pekerjaan</p>
                {role === "freelancer" && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </button>

              <button
                id="role-employer"
                type="button"
                onClick={() => setRole("client")}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${role === "client" ? "border-[#8cbbed] bg-blue-50/50" : "border-slate-200 hover:border-slate-300 bg-slate-50"}`}
              >
                <span className="text-2xl mb-2 block">🏢</span>
                <p className="font-bold text-slate-800 text-sm">Client</p>
                <p className="text-xs text-slate-500 mt-0.5">Saya ingin mempekerjakan</p>
                {role === "client" && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap <span className="text-red-400">*</span></label>
              <input
                id="register-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Masukkan nama lengkap Anda"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email <span className="text-red-400">*</span></label>
              <input
                id="register-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="nama@email.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">No. Telepon</label>
                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+62 812 3456 7890"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kota / Lokasi</label>
                <input
                  id="register-location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Jakarta, Indonesia"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password <span className="text-red-400">*</span></label>
              <input
                id="register-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Minimal 8 karakter"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Konfirmasi Password <span className="text-red-400">*</span></label>
              <input
                id="register-confirm-password"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Ulangi password Anda"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all"
              />
            </div>

            <Button
              id="register-submit"
              type="submit"
              variant="primary"
              className="w-full mt-2"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Membuat akun..." : `Daftar sebagai ${role === "freelancer" ? "Freelancer" : "Client"}`}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-bold transition-colors hover:underline"
                style={{ color: colors.primary }}
              >
                Masuk sekarang
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
