"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconDollar } from "../icons";
import { Button } from "../ui";
import { useAuth } from "@/context/AuthContext";

export const ManageApplicantsPage = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  const router = useRouter();
  const { token } = useAuth();
  
  const [jobDetail, setJobDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const dummyApplicants = [
    {
      id: 1,
      name: "Budi Santoso",
      avatar: "https://i.pravatar.cc/150?u=budi",
      coverLetter: "Saya memiliki pengalaman 5 tahun di bidang ini dan siap membantu proyek Anda.",
      bidAmount: "Rp 5000.00",
      skills: ["React", "Node.js"]
    },
    {
      id: 2,
      name: "Siti Aminah",
      avatar: "https://i.pravatar.cc/150?u=siti",
      coverLetter: "Portofolio saya sangat cocok dengan kebutuhan proyek ini.",
      bidAmount: "Rp 4500.00",
      skills: ["UI/UX", "Figma"]
    }
  ];

  useEffect(() => {
    if (jobId && token) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.project) {
          setJobDetail(data.project);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [jobId, token]);

  const handleAccept = (applicantId: number) => {
    alert("Pelamar diterima! Anda akan diarahkan ke halaman kelola kontrak.");
    router.push(`/manage-job?job=${jobId}&role=client`);
  };

  const handleReject = (applicantId: number) => {
    alert("Pelamar ditolak.");
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
            <IconDollar /> <span className="text-slate-700">Rp {jobDetail.budget_min} {jobDetail.budget_max ? `- Rp ${jobDetail.budget_max}` : ""} <span className="text-slate-500 font-normal">({jobDetail.job_type})</span></span>
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

      <div>
        <h2 className="text-xl font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">Daftar Pelamar</h2>
        <div className="space-y-4">
          {dummyApplicants.map(applicant => (
            <div key={applicant.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <img src={applicant.avatar} alt={applicant.name} className="w-16 h-16 rounded-full object-cover" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">{applicant.name}</h3>
                <p className="text-slate-600 text-sm mt-1">{applicant.coverLetter}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <span className="font-semibold text-slate-700">Bid: {applicant.bidAmount}</span>
                  <div className="flex gap-2">
                    {applicant.skills.map(skill => (
                      <span key={skill} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                <Button variant="outline" size="sm" onClick={() => handleReject(applicant.id)} className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50">Tolak</Button>
                <Button size="sm" onClick={() => handleAccept(applicant.id)} className="flex-1 md:flex-none">Terima</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
