"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

export default function Page() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  const router = useRouter();
  const { token } = useAuth();
  
  const [jobDetail, setJobDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [applicants, setApplicants] = useState<any[]>([]);

  const [showConfirmAccept, setShowConfirmAccept] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);

  useEffect(() => {
    if (jobId && token) {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      fetch(`${apiUrl}/projects/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.project) {
          setJobDetail(data.project);
        } else if (data.id) {
          setJobDetail(data);
        }
      })
      .catch(console.error);

      fetch(`${apiUrl}/bids/project/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.bids) {
          const formattedApplicants = data.bids.map((bid: any) => ({
            id: bid.id || `msg-${bid.freelancer_id}`,
            name: bid.freelancer_name || "Unknown Freelancer",
            freelancerId: bid.freelancer_id,
            avatar: bid.profile_picture || null,
            coverLetter: bid.cover_letter || "Tidak ada pesan tambahan.",
            skills: Array.isArray(bid.freelancer_skills) ? bid.freelancer_skills : [],
            status: bid.status === 'pending' ? 'PENDING' : bid.status === 'accepted' ? 'HIRED' : bid.status === 'withdrawn' || bid.status === 'completed' ? 'COMPLETED' : 'REJECTED',
            isMessageOnly: bid.is_message_only
          }));
          setApplicants(formattedApplicants);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [jobId, token]);

  const handleAcceptClick = (applicantId: string) => {
    setSelectedApplicant(applicantId);
    setShowConfirmAccept(true);
  };

  const confirmAccept = async () => {
    if (selectedApplicant === null || !token) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      let finalBidId = selectedApplicant;

      if (selectedApplicant.startsWith('msg-')) {
        const freelancerId = selectedApplicant.replace('msg-', '');
        const bidResponse = await fetch(`${apiUrl}/bids`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            project_id: jobId, 
            freelancer_id: freelancerId, 
            bid_amount: jobDetail.budget_max || jobDetail.budget_min || 0,
            cover_letter: "Accepted from conversation."
          })
        });

        if (bidResponse.ok) {
          const bidData = await bidResponse.json();
          finalBidId = bidData.bid.id;
        } else {
          const errorData = await bidResponse.json();
          alert(`Gagal memproses lamaran: ${errorData.error || "Terjadi kesalahan server"}`);
          return;
        }
      }

      const response = await fetch(`${apiUrl}/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bid_id: finalBidId })
      });

      if (response.ok) {
        const applicantObj = applicants.find(a => a.id === selectedApplicant);
        if (applicantObj?.freelancerId) {
          try {
            const convRes = await fetch(`${apiUrl}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ other_user_id: applicantObj.freelancerId, job_id: jobId })
            });
            const convData = await convRes.json();
            if (convRes.ok && convData.conversation) {
              await fetch(`${apiUrl}/messages/${convData.conversation.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  content: `Selamat! Anda telah terpilih untuk proyek "${jobDetail.title}". Mari kita diskusikan langkah selanjutnya.`
                })
              });
            }
          } catch (e) {
            console.error("Failed to send auto-message", e);
          }
        }

        setApplicants(prev => prev.map(app => {
          if (app.id === selectedApplicant) {
            return { ...app, status: "HIRED" };
          }
          return { ...app, status: "REJECTED" };
        }));

        setShowConfirmAccept(false);
        alert("Berhasil merekrut freelancer! Anda akan diarahkan ke halaman manajemen proyek.");
        
        setTimeout(() => {
          router.push(`/manage-job?job=${jobId}&role=client`);
        }, 1500);
      } else {
        const errorData = await response.json();
        alert(`Gagal merekrut: ${errorData.error || "Terjadi kesalahan server"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const cancelAccept = () => {
    setShowConfirmAccept(false);
    setSelectedApplicant(null);
  };

  const handleReject = async (applicantId: string) => {
    if (!token) return;

    if (window.confirm("Apakah Anda yakin ingin menolak pelamar ini?")) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        let finalBidId = applicantId;
        
        if (applicantId.startsWith('msg-')) {
          const freelancerId = applicantId.split('-')[1];
          const bidResponse = await fetch(`${apiUrl}/bids`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ 
              project_id: jobId, 
              freelancer_id: freelancerId,
              bid_amount: 0,
              cover_letter: "Rejected from conversation."
            })
          });

          if (bidResponse.ok) {
            const bidData = await bidResponse.json();
            finalBidId = bidData.bid.id;
          } else {
            const errorData = await bidResponse.json();
            alert(`Gagal memproses penolakan: ${errorData.error || "Terjadi kesalahan server"}`);
            return;
          }
        }

        const response = await fetch(`${apiUrl}/bids/${finalBidId}/reject`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const applicantObj = applicants.find(a => a.id === applicantId);
          if (applicantObj?.freelancerId) {
            try {
              const convRes = await fetch(`${apiUrl}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ other_user_id: applicantObj.freelancerId, job_id: jobId })
              });
              const convData = await convRes.json();
              if (convRes.ok && convData.conversation) {
                await fetch(`${apiUrl}/messages/${convData.conversation.id}/messages`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({
                    content: `Halo. Terima kasih atas ketertarikan Anda pada proyek "${jobDetail.title}". Sayangnya, kami memutuskan untuk melanjutkan dengan kandidat lain kali ini. Tetap semangat!`
                  })
                });
              }
            } catch (e) {
              console.error("Failed to send auto-message", e);
            }
          }

          setApplicants(prev => prev.map(app => 
            app.id === applicantId ? { ...app, status: "REJECTED" } : app
          ));
        } else {
          const errorData = await response.json();
          alert(`Gagal menolak: ${errorData.error || "Terjadi kesalahan server"}`);
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan jaringan.");
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10">Memuat detail pekerjaan...</div>;
  }

  if (!jobDetail) {
    return <div className="text-center py-10">Pekerjaan tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-slate-800">{jobDetail.title}</h1>
          <span className="px-3 py-1 bg-[#8cbbed]/20 text-[#2970b5] rounded-full text-sm font-semibold">
            Status: {jobDetail.status}
          </span>
        </div>
        
        <p className="text-slate-600 mb-6 whitespace-pre-line">{jobDetail.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold text-slate-500 mb-6">
          <div className="flex items-center gap-2">
            Budget: <span className="text-slate-700">Rp {jobDetail.budget_min} <span className="text-slate-500 font-normal">({jobDetail.job_type})</span></span>
          </div>
          <div className="flex items-center gap-2">
            Waktu Pengerjaan: <span className="text-slate-700">{jobDetail.estimated_time}</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm text-slate-500 font-bold mb-2">Skill Requirement:</h3>
          <div className="flex flex-wrap gap-2">
            {jobDetail.skills && jobDetail.skills.length > 0 ? (
              jobDetail.skills.map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-lg">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-sm">Tidak ada spesifikasi skill</span>
            )}
          </div>
        </div>
      </div>

      {jobDetail.status === 'progress' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-blue-700">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-lg">Freelancer Telah Terpilih!</p>
              <p className="text-sm">Proyek ini sedang berjalan. Anda dapat mengelola progres dan pembayaran di halaman manajemen.</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push(`/manage-job?job=${jobId}&role=client`)}
            className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap shadow-sm"
          >
            Kelola Proyek & Pembayaran
          </Button>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">
          {jobDetail.status === 'progress' || jobDetail.status === 'closed' ? "Freelancer Terpilih" : "Daftar Pelamar"}
        </h2>
        <div className="space-y-4">
          {applicants.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 text-slate-500">
              Belum ada pelamar untuk pekerjaan ini.
            </div>
          ) : (
            applicants
              .filter(a => (jobDetail.status !== 'progress' && jobDetail.status !== 'closed') || a.status === 'HIRED' || a.status === 'COMPLETED')
              .map(applicant => (
            <div key={applicant.id} className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border ${applicant.status === "HIRED" ? "border-green-400 bg-green-50" : applicant.status === "COMPLETED" ? "border-blue-400 bg-blue-50" : applicant.status === "REJECTED" ? "border-slate-200 opacity-60" : "border-slate-200"} flex flex-col md:flex-row gap-6 items-start md:items-center`}>
              {applicant.avatar ? (
                <img src={applicant.avatar} alt={applicant.name} onClick={() => router.push(`/profile/${applicant.freelancerId}`)} className="cursor-pointer w-16 h-16 rounded-full object-cover shadow-sm border border-slate-100" />
              ) : (
                <div onClick={() => router.push(`/profile/${applicant.freelancerId}`)} className="cursor-pointer w-16 h-16 rounded-full bg-[#8cbbed] flex items-center justify-center text-white font-bold text-2xl shadow-sm border-2 border-white shrink-0">
                  {applicant.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 cursor-pointer group" onClick={() => router.push(`/profile/${applicant.freelancerId}`)}>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#8cbbed] transition-colors">{applicant.name}</h3>
                  {applicant.status === "HIRED" && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Diterima</span>}
                  {applicant.status === "COMPLETED" && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Pekerjaan Selesai</span>}
                  {applicant.status === "REJECTED" && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">Ditolak</span>}
                </div>
                <p className="text-slate-600 text-sm mt-1">{applicant.coverLetter}</p>
                <div className="mt-3 flex gap-2">
                  {applicant.skills.map((skill: string) => (
                    <span key={skill} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{skill}</span>
                  ))}
                </div>
              </div>
              {applicant.status === "PENDING" && (
                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                  <Button variant="outline" size="sm" onClick={() => handleReject(applicant.id)} className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50">Tolak</Button>
                  <Button size="sm" onClick={() => handleAcceptClick(applicant.id)} className="flex-1 md:flex-none">Terima</Button>
                </div>
              )}
            </div>
            ))
          )}
        </div>
      </div>

      {showConfirmAccept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full animate-fade-in-up border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Konfirmasi Perekrutan</h3>
            <p className="text-slate-600 mb-6">
              Anda akan merekrut pelamar ini sesuai dengan budget proyek awal. Jika Anda melanjutkan, semua pelamar lain akan otomatis ditolak. Lanjutkan?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelAccept} className="border-slate-200 text-slate-600">Batal</Button>
              <Button onClick={confirmAccept} className="bg-[#8cbbed] hover:bg-[#72aae6] text-white">Ya, Rekrut</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
