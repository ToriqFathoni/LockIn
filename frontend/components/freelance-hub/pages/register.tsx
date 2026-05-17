"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { colors } from "../data";
import { Button } from "../ui";
import { useAuth } from "@/context/AuthContext";

const steps = [
  { id: 1, title: "Info Dasar", description: "Nama, email, kontak, dan password" },
  { id: 2, title: "Profil Profesional", description: "Skills, achievements, dan experience" },
  { id: 3, title: "CV", description: "Upload PDF opsional untuk profil" },
];

const AVAILABLE_SKILLS = [
  "Frontend Engineer",
  "Data Engineer",
  "Backend Engineer",
  "DevOps Engineer",
  "Network Engineer",
  "Mobile Developer",
  "Database Administrator",
  "Cloud Architect",
  "Machine Learning Engineer",
  "Systems Programmer"
];

const splitLines = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const MAX_CV_SIZE_BYTES = 3 * 1024 * 1024;

export const RegisterPage = () => {
  const router = useRouter();
  const { user, login, isLoading: isAuthLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvPreview, setCvPreview] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
    skills: "",
    achievements: "",
    experience: "",
  });

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/home");
    }
  }, [isAuthLoading, router, user]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleSkill(skill: string) {
    const currentSkills = form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];
    if (currentSkills.includes(skill)) {
      setForm((prev) => ({ ...prev, skills: currentSkills.filter((s) => s !== skill).join(", ") }));
    } else {
      setForm((prev) => ({ ...prev, skills: [...currentSkills, skill].join(", ") }));
    }
  }

  function validateStepOne() {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.location.trim()) {
      setError("Lengkapi nama, email, nomor HP, dan lokasi terlebih dahulu.");
      return false;
    }

    if (!form.password || form.password.length < 8) {
      setError("Password harus minimal 8 karakter.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return false;
    }

    return true;
  }

  function handleCvChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");

    if (!file) {
      setCvFile(null);
      setCvPreview("");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("CV harus berformat PDF.");
      event.target.value = "";
      setCvFile(null);
      setCvPreview("");
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      setError("Ukuran CV terlalu besar. Maksimal 3 MB.");
      event.target.value = "";
      setCvFile(null);
      setCvPreview("");
      return;
    }

    setCvFile(file);
    setCvPreview(file.name);
  }

  async function handleNext() {
    setError("");

    if (step === 1 && !validateStepOne()) {
      return;
    }

    setStep((current) => Math.min(current + 1, 3));
  }

  function handleBack() {
    setError("");
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!validateStepOne()) {
      setStep(1);
      return;
    }

    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    setIsSubmitting(true);

    try {
      const cvPayload = cvFile
        ? {
            name: cvFile.name,
            type: cvFile.type,
            data: await readFileAsDataUrl(cvFile),
          }
        : null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
          password: form.password,
          skills: splitLines(form.skills),
          achievements: splitLines(form.achievements),
          experience: form.experience.trim() || null,
          cv: cvPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrasi gagal. Coba lagi.");
        return;
      }

      login(data.token, data.user);
      router.push("/profile");
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const progressWidth = `${((step - 1) / (steps.length - 1)) * 100}%`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 animate-fade-in relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob pointer-events-none" style={{ backgroundColor: colors.primary }} />

      <div className="w-full max-w-3xl relative z-10">
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
          <p className="text-slate-500 text-sm">Gabung sebagai freelancer dan client dalam satu akun</p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] border border-slate-100 p-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {steps.map((item) => (
                <span key={item.id} className={step === item.id ? "text-slate-800" : ""}>
                  {item.title}
                </span>
              ))}
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: progressWidth, background: `linear-gradient(135deg, ${colors.primary}, #60a5fa)` }} />
            </div>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.id} className={`rounded-2xl border px-4 py-3 transition-all ${step === item.id ? "border-blue-200 bg-blue-50/70" : "border-slate-100 bg-slate-50/60"}`}>
                <p className="text-sm font-bold text-slate-800">Langkah {item.id}</p>
                <p className="text-xs text-slate-500 mt-1">{item.description}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4 animate-fade-in-up">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap <span className="text-red-400">*</span></label>
                  <input id="register-name" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Masukkan nama lengkap Anda" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email <span className="text-red-400">*</span></label>
                  <input id="register-email" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="nama@email.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">No. Telepon <span className="text-red-400">*</span></label>
                    <input id="register-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+62 812 3456 7890" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Kota / Lokasi <span className="text-red-400">*</span></label>
                    <input id="register-location" type="text" name="location" value={form.location} onChange={handleChange} required placeholder="Jakarta, Indonesia" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Password <span className="text-red-400">*</span></label>
                  <input id="register-password" type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Minimal 8 karakter" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Konfirmasi Password <span className="text-red-400">*</span></label>
                  <input id="register-confirm-password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="Ulangi password Anda" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all" />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4 animate-fade-in-up">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Keahlian Utama (Skills)</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SKILLS.map((skill) => {
                      const selectedList = form.skills ? form.skills.split(",").map(s => s.trim()) : [];
                      const isSelected = selectedList.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            isSelected
                              ? "bg-blue-100 border-blue-300 text-blue-700"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Achievements</label>
                  <textarea name="achievements" value={form.achievements} onChange={handleChange} rows={4} placeholder="Pisahkan tiap pencapaian dengan baris baru atau koma" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Experience</label>
                  <textarea name="experience" value={form.experience} onChange={handleChange} rows={5} placeholder="Ceritakan pengalaman profesional Anda secara singkat" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-slate-700 placeholder-slate-400 transition-all resize-none" />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4 animate-fade-in-up">
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Upload CV PDF</label>
                  <input id="register-cv" type="file" accept="application/pdf" onChange={handleCvChange} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-100" />
                  <p className="mt-3 text-xs text-slate-500">Format wajib PDF. Upload di langkah ini bersifat opsional. Maksimal 3 MB.</p>
                  {cvPreview ? <p className="mt-3 text-sm font-semibold text-slate-700">File terpilih: {cvPreview}</p> : null}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-2">
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => router.push("/login")} className="px-4">
                  Sudah punya akun
                </Button>
              </div>

              <div className="flex gap-3 sm:justify-end">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={handleBack} className="min-w-28">
                    Kembali
                  </Button>
                ) : null}

                {step < 3 ? (
                  <Button type="button" variant="primary" onClick={handleNext} className="min-w-32">
                    Lanjut
                  </Button>
                ) : (
                  <Button id="register-submit" type="submit" variant="primary" className="min-w-32" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Membuat akun..." : "Daftar Akun"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};