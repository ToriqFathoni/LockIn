"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { colors } from "@/components/freelance-hub/data";
import { useAuth } from "@/context/AuthContext";
import { IconBriefcase, IconCheckCircle, IconClock, IconMapPin, IconMessage, IconPlus, IconSearch, IconShieldCheck, IconStar, IconUser, IconWallet } from "@/components/freelance-hub/icons";
import { Badge, Button, CustomModal, Rating } from "@/components/ui";

function formatBudgetDisplay(min: any, max: any, type?: string) {
  const formatRupiah = (val: any) => {
    if (!val) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const formattedMin = formatRupiah(min);
  const formattedMax = formatRupiah(max);

  if (formattedMin && formattedMax && formattedMin !== formattedMax) {
    return `${formattedMin} - ${formattedMax}`;
  }
  return formattedMin || formattedMax || "Negotiable";
}

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    async function fetchJob() {
      if (!params?.id) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/projects/public/${params.id}`);
        if (!res.ok) {
          throw new Error("Pekerjaan tidak ditemukan");
        }
        const data = await res.json();
        setJob(data.project || data);
      } catch (err: any) {
        setFetchError(err.message || "Gagal memuat detail pekerjaan");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchJob();
  }, [params?.id]);

  const isJobOpen = !job?.status || job.status === "open" || job.status === "Active";

  useEffect(() => {
    if (token && job?.id) {
      checkSavedStatus();
      checkAppliedStatus();
    }
  }, [token, job?.id]);

  const checkAppliedStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/bids/check/${job.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setIsApplied(data.applied || false);
    } catch (err) {
      console.error('Error checking applied status:', err);
    }
  };

  const checkSavedStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/saved-jobs/check/${job.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setIsSaved(data.isSaved || false);
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const handleSaveJob = async () => {
    if (!token || !user) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    if (user.id === (job?.client?.id || job?.id)) {
      alert('Anda tidak dapat menyimpan pekerjaan milik Anda sendiri');
      return;
    }

    setIsSaving(true);
    try {
      const endpoint = isSaved ? '/unsave' : '';
      const url = isSaved 
        ? `${process.env.NEXT_PUBLIC_API_URL}/saved-jobs/unsave`
        : `${process.env.NEXT_PUBLIC_API_URL}/saved-jobs`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: job.id,
        }),
      });

      if (res.ok) {
        setIsSaved(!isSaved);
        alert(isSaved ? 'Pekerjaan dihapus dari Saved Jobs' : 'Pekerjaan disimpan ke Saved Jobs');
      } else {
        alert('Gagal menyimpan pekerjaan');
      }
    } catch (err) {
      console.error('Error saving job:', err);
      alert('Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyJob = async () => {
    if (!token || !user) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    const jobOwnerId = job?.client?.id;
    if (!jobOwnerId) {
      alert('Informasi client tidak ditemukan');
      return;
    }

    if (user.id === jobOwnerId) {
      alert('Anda tidak dapat apply job milik Anda sendiri');
      return;
    }

    setIsApplying(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          other_user_id: jobOwnerId,
          job_id: job.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Gagal apply job');
        return;
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: job.id,
          bid_amount: (job as any).budget_min || 0,
          cover_letter: "Halo! Saya tertarik dengan pekerjaan ini.",
        }),
      });

      setIsApplied(true);
      setModalOpen(true);
    } catch (err) {
      console.error('Error applying job:', err);
      alert('Tidak dapat terhubung ke server');
    } finally {
      setIsApplying(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
          Memuat detail pekerjaan...
        </div>
      </div>
    );
  }

  if (fetchError || !job) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Pekerjaan Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6">{fetchError || "Pekerjaan yang Anda cari mungkin telah dihapus atau tidak tersedia."}</p>
          <Button variant="outline" onClick={() => router.push("/home")}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  const jobTitle = job?.title || 'Job Title';
  const jobType = job?.job_type || job?.type || 'Project';
  const jobDuration = job?.estimated_time || job?.duration || 'TBD';
  const jobBudget = formatBudgetDisplay(job?.budget_min, job?.budget_max, job?.job_type);
  const jobDescription = job?.description || 'No description provided';
  const jobSkills = Array.isArray(job?.skills) ? job.skills : [];
  
  const clientName = job?.client?.name || 'Unknown Client';
  const clientRating = job?.client?.rating || 0;
  const clientLocation = job?.client?.location || 'Remote';
  const clientVerified = job?.client?.verified ?? true;

  const isOnGoing = (job as any)?.contract_status === 'on_progress';
  const isDone = (job as any)?.contract_status === 'completed';
  const isRejected = (job as any)?.bid_status === 'rejected';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <CustomModal isOpen={modalOpen} onClose={() => router.push("/messages")} title="Proposal Terkirim!" message={`Proposal Anda untuk pekerjaan "${jobTitle}" telah berhasil dikirim ke klien dengan pesan template. Silakan tunggu respons klien di halaman messages.`} actionText="Lihat Pesan Saya" onAction={() => router.push("/messages")} />
        <button onClick={() => router.push("/home")} className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold group"><span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Search</button>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{jobTitle}</h1>
              {isOnGoing && (
                <span className="inline-block px-4 py-2 bg-green-100 text-green-700 font-semibold text-sm rounded-full">
                  ON GOING
                </span>
              )}
              {isDone && (
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 font-semibold text-sm rounded-full">
                  DONE
                </span>
              )}
              {isRejected && (
                <span className="inline-block px-4 py-2 bg-red-100 text-red-700 font-semibold text-sm rounded-full">
                  Ditolak
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><IconClock /></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{jobType}</p>
                  <p className="text-xs text-slate-500">{jobDuration}</p>
                </div>
              </div>
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-bold text-sm">Rp</div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{jobBudget}</p>
                  <p className="text-xs text-slate-500">Budget</p>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Job Description</h3>
            <p className="text-slate-700 leading-relaxed mb-8 whitespace-pre-line">{jobDescription}</p>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Skills and Expertise</h3>
            <div className="flex flex-wrap gap-2 mb-2">{jobSkills.length > 0 ? jobSkills.map((skill: string) => (<Badge key={skill} text={skill} type="primary" />)) : <p className="text-slate-500 text-sm">No specific skills required</p>}</div>
          </div>
        </div>
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
            <Button 
              variant="primary" 
              className={`w-full mb-4 ${isApplied ? "bg-slate-200 text-slate-600 hover:bg-slate-200 border-none" : ""}`} 
              onClick={handleApplyJob} 
              disabled={isApplying || isApplied || !isJobOpen}
            >
              {isApplying ? 'Applying...' : isApplied ? 'Applied' : 'Apply Now'}
            </Button>
            <Button 
              variant={isSaved ? "primary" : "outline"} 
              className="w-full mb-6" 
              onClick={handleSaveJob}
              disabled={isSaving}
            >
              {isSaving ? 'Loading...' : isSaved ? '⭐ Saved' : 'Save Job'}
            </Button>
            <div className="pt-6 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 mb-4">About the Client</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {job?.client?.avatar ? (
                    <img 
                      src={job.client.avatar} 
                      alt={clientName} 
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 cursor-pointer shrink-0"
                      onClick={() => {
                        if (job?.client?.id) router.push(`/profile/${job.client.id}`);
                      }}
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-full bg-[#8cbbed] text-white flex items-center justify-center font-bold text-xl cursor-pointer shrink-0"
                      onClick={() => {
                        if (job?.client?.id) router.push(`/profile/${job.client.id}`);
                      }}
                    >
                      {clientName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p 
                      className="font-semibold text-[#8cbbed] hover:text-[#7aaad9] cursor-pointer transition-colors"
                      onClick={() => {
                        if (job?.client?.id) {
                          router.push(`/profile/${job.client.id}`);
                        }
                      }}
                    >
                      {clientName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Rating score={clientRating} />
                      <span className="text-xs text-slate-500">(12 reviews)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="flex items-center gap-2 text-sm text-slate-700"><IconMapPin /> {clientLocation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
