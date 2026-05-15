"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, CustomModal } from "../ui";
import { useAuth } from "@/context/AuthContext";

export const PostJobPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user === null) {
      router.push("/home");
    }
  }, [user, router]);

  if (!user) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setModalOpen(true);
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
            <input type="text" placeholder="Cth: Butuh desainer UI/UX untuk aplikasi Fintech" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" required />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Pekerjaan</label>
            <textarea rows={5} placeholder="Jelaskan kebutuhan proyek Anda secara detail..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700 resize-none" required />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Budget (Rp)</label>
              <input type="number" placeholder="Cth: 5000000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tipe Pekerjaan</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700">
                <option>Fixed Price</option>
                <option>Hourly Rate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Skill Requirement</label>
            <input type="text" placeholder="Cth: PostgreSQL, Javascript, UI/UX Design" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" required />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Estimated Time</label>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 flex-1">
                <input type="number" placeholder="Min" min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" required />
                <span className="text-slate-500 font-bold">-</span>
                <input type="number" placeholder="Max" min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" required />
              </div>
              <div className="w-1/3">
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8cbbed] text-slate-700" defaultValue="Day" required>
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
            <Button variant="primary" type="submit">Posting Pekerjaan</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
