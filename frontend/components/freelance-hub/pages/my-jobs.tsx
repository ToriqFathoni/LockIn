"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors, mockJobs } from "../data";
import { IconDollar } from "../icons";
import { Button } from "../ui";
import { useAuth } from "@/context/AuthContext";

export const MyJobsPage = () => {
  const [activeTab, setActiveTab] = useState("Applied Jobs");
  const router = useRouter();
  const { user, token } = useAuth();
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hiredJobsState, setHiredJobsState] = useState<Record<string, boolean>>({});

  const appliedJobs = mockJobs.slice(0, 2);

  useEffect(() => {
    setHiredJobsState(JSON.parse(localStorage.getItem("hiredDummyJobs") || "{}"));
  }, [activeTab]);

  const fetchJobs = () => {
    if (token) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.projects) {
            const formatted = data.projects.map((p: any) => ({
              id: p.id,
              title: p.title,
              budget: `Rp ${p.budget_min}`,
              client: { name: user?.name || "Anda" },
              skills: p.skills || [],
              duration: p.estimated_time || "-",
              type: p.job_type,
              status: p.status,
            }));
            setPostedJobs(formatted);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (activeTab === "Posted Jobs") {
      fetchJobs();
    }
  }, [activeTab, token, user]);

  const handleDeleteJob = async (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    
    if (window.confirm("Apakah Anda yakin ingin membatalkan/menghapus pekerjaan ini? Tindakan ini tidak dapat dibatalkan.")) {
      setIsDeleting(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${jobId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "canceled" }),
        });

        if (response.ok) {
          alert("Pekerjaan berhasil dihapus.");
          fetchJobs();
        } else {
          const errorData = await response.json();
          alert(`Gagal menghapus pekerjaan: ${errorData.error || "Kesalahan server"}`);
        }
      } catch (error) {
        console.error("Gagal saat membatalkan pekerjaan:", error);
        alert("Terjadi kesalahan sistem saat menghubungi server.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const displayJobs = activeTab === "Applied Jobs" ? appliedJobs : postedJobs;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">My Jobs Dashboard</h1>

        <div className="flex flex-wrap gap-4">
          <button onClick={() => setActiveTab("Applied Jobs")} className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "Applied Jobs" ? "text-white shadow-md" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"}`} style={activeTab === "Applied Jobs" ? { backgroundColor: colors.primary } : {}}>
            Pekerjaan yang Dilamar (Freelancer)
          </button>
          <button onClick={() => setActiveTab("Posted Jobs")} className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "Posted Jobs" ? "text-white shadow-md" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"}`} style={activeTab === "Posted Jobs" ? { backgroundColor: colors.primary } : {}}>
            Pekerjaan Diposting (Klien)
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">{activeTab === "Applied Jobs" ? "Pekerjaan Aktif Anda" : "Proyek yang Anda Kelola"}</h2>

        {loading ? (
          <p className="text-center text-slate-500 py-8">Memuat pekerjaan...</p>
        ) : displayJobs.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Belum ada pekerjaan di tab ini.</p>
        ) : (
          displayJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            onClick={() => router.push(activeTab === "Applied Jobs" ? `/manage-job?job=${job.id}&role=freelancer` : `/manage-applicants?job=${job.id}`)}
          >
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 hover:text-[#8cbbed] transition-colors mb-2">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-slate-500">
                {activeTab === "Applied Jobs" ? (
                  <span className="flex items-center gap-1 text-slate-700">
                    <IconDollar /> {job.budget}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-700">
                    {job.budget} <span className="text-slate-500 font-normal">({job.type === "Hourly" ? "Hourly Rate" : job.type})</span>
                  </span>
                )}
                <span>•</span>
                <span>{activeTab === "Applied Jobs" ? `Klien: ${job.client.name}` : `Diposting oleh: Anda`}</span>
                <span>•</span>
                <span className="text-slate-600">Estimasi Waktu: {job.duration}</span>
                <span>•</span>
                <span className={`${activeTab === "Posted Jobs" && hiredJobsState[job.id] ? "text-yellow-600" : "text-[#8cbbed]"} font-bold`}>
                  Status: {activeTab === "Posted Jobs" && hiredJobsState[job.id] ? "In Progress" : job.status === "open" ? "Active" : job.status}
                </span>
              </div>
              {activeTab === "Posted Jobs" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-slate-500 font-bold mt-1">Skill Requirement:</span>
                  {job.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  if (activeTab === "Posted Jobs" && hiredJobsState[job.id]) {
                    router.push(`/manage-job?job=${job.id}&role=client`);
                  } else {
                    router.push(activeTab === "Applied Jobs" ? `/manage-job?job=${job.id}&role=freelancer` : `/manage-applicants?job=${job.id}`);
                  }
                }}
              >
                {activeTab === "Applied Jobs" ? "Lihat Pembayaran" : hiredJobsState[job.id] ? "Lihat Pembayaran" : "Lihat Detail"}
              </Button>
              {activeTab === "Posted Jobs" && job.status === "open" && !hiredJobsState[job.id] && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  disabled={isDeleting}
                  onClick={(e) => handleDeleteJob(e, job.id)}
                >
                  {isDeleting ? "Menghapus..." : "Hapus Pekerjaan"}
                </Button>
              )}
            </div>
          </div>
        )))}
      </div>
    </div>
  );
};
