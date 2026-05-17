"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors, mockJobs } from "../data";
import { Button } from "../ui";
import { useAuth } from "@/context/AuthContext";

export const MyJobsPage = () => {
  const [activeTab, setActiveTab] = useState("Applied Jobs");
  const router = useRouter();
  const { user, token } = useAuth();
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hiredJobsState, setHiredJobsState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setHiredJobsState(JSON.parse(localStorage.getItem("hiredDummyJobs") || "{}"));
  }, [activeTab]);

  const fetchPostedJobs = () => {
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
            const formatted = data.projects
              .filter((p: any) => p.status !== 'canceled')  
              .map((p: any) => ({
              id: p.id,
              title: p.title,
              budget: `Rp ${p.budget_min?.toLocaleString('id-ID') || p.budget_min}`,
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

  const fetchAppliedJobs = () => {
    if (token) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/applied`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.projects) {
            const formatted = data.projects
              .filter((p: any) => {
                if (p.client_id === user?.id) return false;
                
                return p.contract_status === 'on_progress' || p.contract_status === 'completed';
              })
              .map((p: any) => {
                let status = 'applied';
                if (p.contract_status === 'completed') status = 'done';
                else if (p.contract_status === 'on_progress') status = 'on-going';
                else if (p.bid_status === 'rejected') status = 'reject';

                return {
                  id: p.id,
                  title: p.title,
                  budget: `Rp ${p.budget_min?.toLocaleString('id-ID') || p.budget_min}`,
                  client: { name: p.client_name || "Unknown Client" },
                  skills: p.skills || [],
                  duration: p.estimated_time || "-",
                  type: p.job_type,
                  status: status,
                };
              });
            setAppliedJobs(formatted);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (activeTab === "Posted Jobs") {
      fetchPostedJobs();
    } else {
      fetchAppliedJobs();
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
          fetchPostedJobs();
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
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 cursor-pointer flex flex-col justify-between items-start gap-4"
            onClick={() => router.push(activeTab === "Applied Jobs" ? `/manage-job?job=${job.id}&role=freelancer` : (job.status === "progress" || hiredJobsState[job.id]) ? `/manage-job?job=${job.id}&role=client` : `/manage-applicants?job=${job.id}`)}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 hover:text-[#8cbbed] transition-colors mb-2">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-slate-500">
                  {activeTab === "Applied Jobs" ? (
                    <span className="flex items-center gap-1 text-slate-700">
                      {job.budget}
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
                  <span className={`${(activeTab === "Posted Jobs" && (hiredJobsState[job.id] || job.status === "progress" || job.status === "closed")) ? "text-yellow-600" : (job.status === "on-going" || job.status === "done") ? "text-green-500" : job.status === "reject" ? "text-red-500" : "text-[#8cbbed]"} font-bold uppercase`}>
                    Status: {activeTab === "Posted Jobs" && (hiredJobsState[job.id] || job.status === "progress" || job.status === "closed") ? (job.status === "closed" ? "Completed" : "In Progress") : job.status === "open" ? "Active" : job.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[140px]">
                {activeTab === "Posted Jobs" && job.status === "closed" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/manage-applicants?job=${job.id}`);
                      }}
                    >
                      Lihat Pelamar (Detail)
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-[#8cbbed] hover:bg-blue-400"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/manage-job?job=${job.id}&role=client`);
                      }}
                    >
                      Bukti Pembayaran
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      disabled={isDeleting}
                      onClick={(e) => handleDeleteJob(e, job.id)}
                    >
                      {isDeleting ? "Menghapus..." : "Hapus Pekerjaan"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (activeTab === "Posted Jobs" && (hiredJobsState[job.id] || job.status === "progress")) {
                          router.push(`/manage-job?job=${job.id}&role=client`);
                        } else {
                          router.push(activeTab === "Applied Jobs" ? `/manage-job?job=${job.id}&role=freelancer` : `/manage-applicants?job=${job.id}`);
                        }
                      }}
                    >
                      {(activeTab === "Applied Jobs" && (job.status === "on-going" || job.status === "done")) ? "Bukti Pembayaran" : activeTab === "Applied Jobs" ? "Lihat Pembayaran" : (activeTab === "Posted Jobs" && (hiredJobsState[job.id] || job.status === "progress")) ? "Kelola Proyek" : "Lihat Detail"}
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
                  </>
                )}
              </div>
            </div>

            {/* Status Messages for Freelancer */}
            {activeTab === "Applied Jobs" && (
              <div className="w-full pt-4 mt-2 border-t border-slate-100">
                {job.status === "on-going" && (
                  <p className="text-sm text-slate-500 font-medium">
                    Pekerjaan sedang berjalan! Lihat di tab My Jobs untuk info lebih detail.
                  </p>
                )}
                {job.status === "done" && (
                  <p className="text-sm text-green-600 font-medium">
                    Pekerjaan telah selesai! Lihat di tab My Jobs untuk info lebih detail.
                  </p>
                )}
                {job.status === "reject" && (
                  <p className="text-sm text-red-500 font-medium italic">
                    "Lamaranmu masih belum diterima, sepertinya kamu belum cocok di pekerjaan ini. Tetap semangat mencari peluang lain ya!"
                  </p>
                )}
                {job.status === "applied" && (
                  <p className="text-sm text-slate-500">
                    Lamaran Anda sedang ditinjau oleh klien.
                  </p>
                )}
              </div>
            )}
          </div>
        )))}
      </div>
    </div>
  );
};
