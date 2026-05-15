"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { mockUser } from "../data";
import { IconBriefcase, IconClock, IconEdit, IconMapPin, IconStar, IconTrophy, IconUpload, IconX } from "../icons";
import { Badge, Button, Rating } from "../ui";
import { useAuth } from "@/context/AuthContext";

type ProfileRecord = {
  user_name?: string;
  user_email?: string;
  user_phone?: string | null;
  user_location?: string | null;
  headline?: string | null;
  bio?: string | null;
  country?: string | null;
  skills?: string[] | null;
  achievements?: string[] | null;
  experience?: string | null;
  cv_file_name?: string | null;
  hourly_rate?: string | number | null;
  avg_rating?: number | string | null;
  total_reviews?: number | string | null;
};

const splitList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const joinList = (value: string[] | null | undefined) => (value && value.length > 0 ? value.join(", ") : "");

const formatHourlyRate = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return mockUser.hourlyRate;
  }

  if (typeof value === "number") {
    return `Rp ${value.toLocaleString("id-ID")}/jam`;
  }

  return String(value);
};

export const ProfilePage = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [form, setForm] = useState({
    title: mockUser.title,
    location: mockUser.location,
    hourlyRate: mockUser.hourlyRate,
    bio: mockUser.bio,
    skills: joinList(mockUser.skills),
    achievements: joinList(mockUser.achievements),
    experience: mockUser.experience ?? "",
  });

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/freelancer-profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok && data.profile) {
          setProfile(data.profile as ProfileRecord);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  const displayProfile = useMemo(() => {
    const resolved = profile ?? {};
    const name = resolved.user_name || mockUser.name;
    const location = resolved.user_location || resolved.country || mockUser.location;
    const title = resolved.headline || mockUser.title;
    const bio = resolved.bio || resolved.experience || mockUser.bio;
    const skills = resolved.skills && resolved.skills.length > 0 ? resolved.skills : mockUser.skills;
    const achievements = resolved.achievements && resolved.achievements.length > 0 ? resolved.achievements : mockUser.achievements ?? [];
    const hourlyRate = formatHourlyRate(resolved.hourly_rate);
    const ratingValue = Number(resolved.avg_rating ?? mockUser.rating);
    const reviewCount = Number(resolved.total_reviews ?? mockUser.reviewCount);

    return {
      name,
      location,
      title,
      bio,
      skills,
      achievements,
      hourlyRate,
      ratingValue: Number.isFinite(ratingValue) ? Math.max(0, Math.min(5, ratingValue)) : mockUser.rating,
      reviewCount: Number.isFinite(reviewCount) ? reviewCount : mockUser.reviewCount,
      phone: resolved.user_phone || "",
      email: resolved.user_email || "",
      cvFileName: resolved.cv_file_name || mockUser.cvFileName || "Belum ada CV",
      experience: resolved.experience || mockUser.experience || "",
    };
  }, [profile]);

  useEffect(() => {
    setForm({
      title: displayProfile.title,
      location: displayProfile.location,
      hourlyRate: displayProfile.hourlyRate,
      bio: displayProfile.bio,
      skills: joinList(displayProfile.skills),
      achievements: joinList(displayProfile.achievements),
      experience: displayProfile.experience,
    });
  }, [displayProfile.title, displayProfile.location, displayProfile.hourlyRate, displayProfile.bio, displayProfile.skills, displayProfile.achievements, displayProfile.experience]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/freelancer-profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          headline: form.title,
          country: form.location,
          hourly_rate: form.hourlyRate,
          bio: form.bio,
          skills: splitList(form.skills),
          achievements: splitList(form.achievements),
          experience: form.experience,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan profile");
      }

      setProfile(data.profile as ProfileRecord);
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan profile");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-full mb-6" />
        <div className="h-64 bg-white rounded-3xl border border-slate-200 mb-6" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-28 bg-white rounded-3xl border border-slate-200" />
          <div className="h-28 bg-white rounded-3xl border border-slate-200" />
          <div className="h-28 bg-white rounded-3xl border border-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{isEditing ? "Edit Profile Settings" : "My Profile"}</h1>
        <Button variant={isEditing ? "ghost" : "outline"} onClick={() => setIsEditing((value) => !value)}>
          {isEditing ? (
            <span className="flex items-center gap-2">
              <IconX /> Batal Edit
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <IconEdit /> Edit Profile
            </span>
          )}
        </Button>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-fade-in">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">{error}</div>
            ) : null}

            <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
              <div className="w-24 h-24 rounded-full bg-[#8cbbed] text-white flex items-center justify-center font-bold text-3xl shadow-md relative group cursor-pointer">
                {displayProfile.name.charAt(0)}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconUpload />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Profile Picture</h3>
                <p className="text-sm text-slate-500 mb-3">JPG or PNG no larger than 5MB.</p>
                <Button variant="outline" size="sm" type="button">
                  Upload New
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                <input type="text" defaultValue={displayProfile.name} disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lokasi</label>
                <input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Professional Title</label>
              <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tarif per Jam (Rp)</label>
              <input value={form.hourlyRate} onChange={(event) => setForm((prev) => ({ ...prev, hourlyRate: event.target.value }))} type="text" className="w-full md:w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Skills</label>
              <textarea value={form.skills} onChange={(event) => setForm((prev) => ({ ...prev, skills: event.target.value }))} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700 resize-none" placeholder="Pisahkan dengan koma atau baris baru" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Achievements</label>
              <textarea value={form.achievements} onChange={(event) => setForm((prev) => ({ ...prev, achievements: event.target.value }))} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700 resize-none" placeholder="Pisahkan dengan koma atau baris baru" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Experience</label>
              <textarea value={form.experience} onChange={(event) => setForm((prev) => ({ ...prev, experience: event.target.value }))} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bio Singkat</label>
              <textarea value={form.bio} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700 resize-none" />
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 rounded-full bg-[#8cbbed] flex items-center justify-center text-white font-extrabold text-5xl shadow-lg border-4 border-white shrink-0">
                {displayProfile.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{displayProfile.name}</h1>
                <p className="text-lg text-slate-600 font-medium mb-4">{displayProfile.title}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
                  <span className="flex items-center gap-1"><IconMapPin /> {displayProfile.location}</span>
                  <span className="flex items-center gap-1"><IconClock /> {displayProfile.hourlyRate}</span>
                  {displayProfile.phone ? <span className="flex items-center gap-1">{displayProfile.phone}</span> : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <IconStar filled />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Rating</p>
                <Rating score={displayProfile.ratingValue} />
                <p className="text-xs text-slate-500 mt-1">{displayProfile.reviewCount} client reviews</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center"><IconTrophy /></div>
              <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Earned</p><p className="text-xl font-black text-slate-800">{mockUser.totalEarned}</p></div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center"><IconBriefcase /></div>
              <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">CV</p><p className="text-lg font-black text-slate-800 truncate">{displayProfile.cvFileName}</p></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">About Me</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{displayProfile.bio}</p>
              {displayProfile.experience ? (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Experience</h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{displayProfile.experience}</p>
                </div>
              ) : null}
            </div>
            <div className="md:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-fit space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Top Skills</h3>
                <div className="flex flex-wrap gap-2">{displayProfile.skills.map((skill) => (<Badge key={skill} text={skill} type="default" />))}</div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Achievements</h3>
                <div className="space-y-2">
                  {displayProfile.achievements.length > 0 ? displayProfile.achievements.map((achievement) => (
                    <div key={achievement} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 border border-slate-100">
                      {achievement}
                    </div>
                  )) : <p className="text-sm text-slate-500">Belum ada achievements yang diisi.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};