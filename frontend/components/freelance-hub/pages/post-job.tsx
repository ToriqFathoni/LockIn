"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, CustomModal } from "../ui";
import { useAuth } from "@/context/AuthContext";

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

export const PostJobPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    jobType: "Fixed Price",
    skills: "",
    minTime: "",
    maxTime: "",
    timeUnit: "Day",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    if (user === null) {
      router.push("/home");
    }
  }, [user, router]);

  if (!user) return null;

  const toggleSkill = (skill: string) => {
    const currentSkills = formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
    if (currentSkills.includes(skill)) {
      setFormData({
        ...formData,
        skills: currentSkills.filter((s) => s !== skill).join(", "),
      });
    } else {
      setFormData({
        ...formData,
        skills: [...currentSkills, skill].join(", "),
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const skillsArray = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);
    if (skillsArray.length === 0) {
      alert("Pilih minimal 1 skill requirement.");
      return;
    }
    
    setLoading(true);

    const estimatedTime = `${formData.minTime} - ${formData.maxTime} ${formData.timeUnit}(s)`;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          budget_min: Number(formData.budget),
          budget_max: Number(formData.budget), 
          job_type: formData.jobType,
          skills: skillsArray,
          estimated_time: estimatedTime,
          status: "open",
        }),
      });

      if (res.ok) {
        setModalOpen(true);
      } else {
        alert("Gagal memposting pekerjaan. Silakan periksa kembali profil/data Anda.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <CustomModal
        isOpen={modalOpen}
        onClose={() => router.push("/my-jobs")}
        title="Pekerjaan Berhasil Diposting!"
        message="Pekerjaan Anda sekarang live dan dapat dilihat oleh para freelancer."
        actionText="Lihat di My Jobs"
        onAction={() => router.push("/my-jobs")}
      />

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Post a Job</h2>
        <p className="text-slate-500 mb-8">Berikan detail pekerjaan agar freelancer terbaik dapat melamar.</p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Pekerjaan</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Cth: Butuh desainer UI/UX untuk aplikasi Fintech" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" required />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Pekerjaan</label>
            <textarea rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Jelaskan kebutuhan proyek Anda secara detail..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700 resize-none" required />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Budget (Rp)</label>
              <input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="Cth: 5000000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tipe Pekerjaan</label>
              <select value={formData.jobType} onChange={(e) => setFormData({ ...formData, jobType: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700">
                <option value="Fixed Price">Fixed Price</option>
                <option value="Hourly Rate">Hourly Rate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Skill Requirement <span className="text-red-400">*</span></label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => {
                const selectedList = formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
                const isSelected = selectedList.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      isSelected
                        ? "bg-[#8cbbed] border-[#8cbbed] text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
            {(!formData.skills || formData.skills.trim() === "") && (
              <p className="text-xs text-red-500 mt-2">Pilih minimal 1 skill.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Estimated Time</label>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 flex-1">
                <input type="number" value={formData.minTime} onChange={(e) => setFormData({ ...formData, minTime: e.target.value })} placeholder="Min" min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" required />
                <span className="text-slate-500 font-bold">-</span>
                <input type="number" value={formData.maxTime} onChange={(e) => setFormData({ ...formData, maxTime: e.target.value })} placeholder="Max" min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" required />
              </div>
              <div className="w-1/3">
                <select value={formData.timeUnit} onChange={(e) => setFormData({ ...formData, timeUnit: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" required>
                  <option value="Day">Day(s)</option>
                  <option value="Week">Week(s)</option>
                  <option value="Month">Month(s)</option>
                  <option value="Year">Year(s)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
            <Button variant="ghost" onClick={() => router.push("/home")}>Batal</Button>
            <Button variant="primary" type="submit" disabled={loading}>{loading ? "Memproses..." : "Posting Pekerjaan"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
