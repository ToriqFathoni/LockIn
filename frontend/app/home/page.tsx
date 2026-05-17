"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { colors } from "@/components/freelance-hub/data";
import type { Job } from "@/components/freelance-hub/types";
import { useAuth } from "@/context/AuthContext";
import {
  IconBriefcase,
  IconCheckCircle,
  IconClock,
  IconMapPin,
  IconMessage,
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconStar,
  IconUser,
  IconWallet,
} from "@/components/freelance-hub/icons";
import { Badge, Button, CustomModal, Rating } from "@/components/ui";

function formatRupiahText(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "Negotiable";
  }

  const text = String(value).trim();
  if (!text || /negotiable/i.test(text)) {
    return "Negotiable";
  }

  const cleaned = text.replace(/^Rp\s*/i, "").trim();
  if (!cleaned.includes("-")) {
    return cleaned || "Negotiable";
  }

  const parts = cleaned.split("-").map((part) => part.replace(/^Rp\s*/i, "").trim());
  if (parts.length === 2 && parts[0] && parts[0] === parts[1]) {
    return parts[0];
  }

  return cleaned || "Negotiable";
}

function formatBudgetDisplay(min?: string | number | null, max?: string | number | null, jobType?: string | null) {
  const minValue = min === null || min === undefined || min === "" ? null : Number(min);
  const maxValue = max === null || max === undefined || max === "" ? null : Number(max);

  if ((minValue === null || Number.isNaN(minValue)) && (maxValue === null || Number.isNaN(maxValue))) {
    return "Negotiable";
  }

  const formattedMin = minValue !== null && !Number.isNaN(minValue) ? minValue.toLocaleString("id-ID") : null;
  const formattedMax = maxValue !== null && !Number.isNaN(maxValue) ? maxValue.toLocaleString("id-ID") : null;

  if (formattedMin && formattedMax) {
    if (formattedMin === formattedMax || /fixed price/i.test(jobType || "")) {
      return formattedMin;
    }

    return `${formattedMin} - ${formattedMax}`;
  }

  return formattedMin || formattedMax || "Negotiable";
}

function getAppliedJobStorageKey(userId?: string | number | null) {
  return userId ? `applied-job-ids:${String(userId)}` : "applied-job-ids";
}



export default function Page() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Recommended Jobs");
  const [apiJobs, setApiJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [realAppliedJobs, setRealAppliedJobs] = useState<any[]>([]);
  const [topSkill, setTopSkill] = useState<string>("");
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [applyingJobId, setApplyingJobId] = useState<string | number | null>(null);
  const [applyError, setApplyError] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const tabs = ["Recommended Jobs", "All Jobs", "Applied Jobs", "Saved Jobs"];

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch(`${apiBaseUrl}/projects/public`);
        if (!res.ok) throw new Error("Gagal memuat data");
        const data = await res.json();
        if (data.projects && data.projects.length > 0) {
          const normalizedJobs = data.projects.map((project: any) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            budget: formatBudgetDisplay(project.budget_min, project.budget_max, project.job_type),
            client: project.client || {
              id: project.client_id,
              name: project.client_name || "Unknown Client",
              rating: project.client_rating || 0,
              verified: true,
              location: project.client_location || "Remote",
            },
            skills: Array.isArray(project.skills) ? project.skills : [],
            postedAt: project.created_at ? new Date(project.created_at).toLocaleDateString() : "Baru saja",
            type: project.job_type || "Project",
            duration: project.estimated_time || "TBD",
            status: project.status,
          }));
          setApiJobs(normalizedJobs);
        } else {
          setApiJobs([]);
        }
      } catch (err) {
        setFetchError("Failed to load jobs");
      } finally {
        setIsFetching(false);
      }
    }

    async function loadRealAppliedJobs() {
      if (!token) return;
      try {
        const res = await fetch(`${apiBaseUrl}/projects/applied`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.projects) {
          // Normalize shape to match the jobs used in other tabs (budget formatting, client object, skills, duration, etc.)
          const normalized = data.projects.map((project: any) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            // formatted budget for display
            budget: formatBudgetDisplay(project.budget_min, project.budget_max, project.job_type),
            budget_min: project.budget_min,
            budget_max: project.budget_max,
            client: project.client || {
              id: project.client_id,
              name: project.client_name || 'Unknown Client',
              rating: project.client_rating || 0,
              verified: true,
              location: project.client_location || 'Remote',
            },
            skills: Array.isArray(project.skills) ? project.skills : [],
            postedAt: project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Baru saja',
            type: project.job_type || 'Project',
            duration: project.estimated_time || 'TBD',
            status: project.status,
            // pass through bid/contract statuses for Applied Jobs logic
            bid_status: project.bid_status || null,
            contract_status: project.contract_status || null,
            // preserve any other useful fields (conversation id etc.)
            conversation_id: project.conversation_id || null,
          }));

          setRealAppliedJobs(normalized);
        }
      } catch (err) {
        console.error("Failed to load applied jobs:", err);
      }
    }

    loadJobs();
    loadRealAppliedJobs();
  }, [apiBaseUrl, token]);

  useEffect(() => {
    async function loadAppliedJobs() {
      if (!token || !user) {
        setAppliedJobIds([]);
        return;
      }

      const storageKey = getAppliedJobStorageKey(user.id);

      try {
        const cached = window.localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setAppliedJobIds(parsed.map((item) => String(item)));
          }
        }
      } catch {
        // Ignore localStorage parsing errors and fall back to server data.
      }

      try {
        const res = await fetch(`${apiBaseUrl}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          setAppliedJobIds([]);
          return;
        }

        const data = await res.json();
        const nextAppliedJobIds = (data.conversations ?? [])
          .map((conversation: any) => conversation.job_id)
          .filter(Boolean)
          .map((jobId: any) => String(jobId));

        setAppliedJobIds((previous) => {
          const merged = Array.from(new Set([...previous, ...nextAppliedJobIds]));
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(merged));
          } catch {
            // Ignore storage write failures.
          }
          return merged;
        });
      } catch {
        setAppliedJobIds((previous) => previous);
      }
    }

    loadAppliedJobs();
  }, [apiBaseUrl, token, user]);

  useEffect(() => {
    async function loadTopSkills() {
      if (!token) {
        setTopSkill("");
        return;
      }

      try {
        const res = await fetch(`${apiBaseUrl}/freelancer-profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const skills = Array.isArray(data?.profile?.skills)
          ? data.profile.skills.filter((skill: unknown) => typeof skill === "string" && skill.trim().length > 0)
          : [];

        setTopSkill(skills.length > 0 ? String(skills[0]).trim().toLowerCase() : "");
      } catch {
        setTopSkill("");
      }
    }

    loadTopSkills();
  }, [apiBaseUrl, token]);

  // Load saved jobs when tab is switched to "Saved Jobs"
  useEffect(() => {
    if (activeTab === "Saved Jobs" && token) {
      loadSavedJobs();
    }
  }, [activeTab, token]);

  async function loadSavedJobs() {
    try {
      const res = await fetch(`${apiBaseUrl}/saved-jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.savedJobs && data.savedJobs.length > 0) {
        // Transform saved jobs to match Job interface
        const transformedJobs = data.savedJobs.map((sj: any) => ({
          id: sj.project_id,
          title: sj.title,
          description: sj.description,
          budget: formatBudgetDisplay(sj.budget_min, sj.budget_max, sj.job_type),
          type: sj.job_type || 'Project',
          duration: sj.estimated_time || 'TBD',
          skills: Array.isArray(sj.skills) ? sj.skills : [],
          client: {
            id: sj.client_id,
            name: sj.client_name || 'Unknown Client',
            rating: 0,
            verified: true,
            location: sj.client_location || 'Remote',
          },
          postedAt: new Date(sj.project_created_at).toLocaleDateString(),
        }));
        setSavedJobs(transformedJobs);
      } else {
        setSavedJobs([]);
      }
    } catch (err) {
      console.error('Error loading saved jobs:', err);
      setSavedJobs([]);
    }
  }

  async function handleApplyJob(jobId: string | number, jobOwnerId: string | number, jobTitle: string) {
    if (!token || !user) {
      setApplyError("Silakan login terlebih dahulu");
      return;
    }

    if (user.id === jobOwnerId) {
      setApplyError("Anda tidak dapat apply job milik Anda sendiri");
      return;
    }

    setApplyingJobId(jobId);
    setApplyError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          other_user_id: jobOwnerId,
          job_id: jobId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApplyError(data.error || "Gagal apply job");
        return;
      }

      // Create a formal bid as well to register the application
      try {
        const job = apiJobs.find(j => j.id === jobId);
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/bids`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            project_id: jobId,
            bid_amount: job ? ((job as any).budget_min || 0) : 0,
            cover_letter: "Halo! Saya tertarik dengan pekerjaan ini.",
          }),
        });
      } catch (bidErr) {
        console.error("Failed to create formal bid:", bidErr);
      }

      setAppliedJobIds((previous) => {
        const next = previous.includes(String(jobId)) ? previous : [...previous, String(jobId)];
        try {
          window.localStorage.setItem(getAppliedJobStorageKey(user.id), JSON.stringify(next));
        } catch {
          // Ignore storage write failures.
        }
        return next;
      });

      // Redirect to messages page
      router.push(`/messages`);
    } catch (err) {
      setApplyError("Tidak dapat terhubung ke server");
    } finally {
      setApplyingJobId(null);
    }
  }

  const jobsSource = apiJobs;
  const visibleJobs = jobsSource.filter((job) => {
    // Only show jobs that are still open
    if (job.status && (job.status as string).toLowerCase() !== "open" && (job.status as string).toLowerCase() !== "active") return false;
    
    if (!user) return true;
    const ownerId = (job as any).client_id || job.client?.id;
    return String(ownerId) !== String(user.id);
  });

  // Merge appliedJobIds from localStorage/conversations with realAppliedJobs from backend
  const allAppliedJobIds = Array.from(new Set([
    ...appliedJobIds, 
    ...realAppliedJobs.map(job => String(job.id))
  ]));

  const allJobs = visibleJobs.filter((job: Job) => !allAppliedJobIds.includes(String(job.id)));
  
  const recommendedJobs = allJobs.filter((job: Job) => {
    if (!topSkill) {
      return true;
    }
    const jobSkills = Array.isArray(job.skills) ? job.skills.map((skill: string) => String(skill).toLowerCase()) : [];
    return jobSkills.includes(topSkill);
  });

  const displayJobs =
    activeTab === "Saved Jobs"
      ? savedJobs
      : activeTab === "All Jobs"
        ? allJobs
        : activeTab === "Applied Jobs"
          ? realAppliedJobs
          : recommendedJobs;
  const filteredJobs = displayJobs.filter((job: any) => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (job.skills && job.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 w-full md:w-auto">Find Work</h1>
        <div className="relative w-full md:w-100">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><IconSearch /></div>
          <input type="text" placeholder="Search for jobs or skills..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-700" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </div>
      </div>
      {fetchError && (
        <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-sm">{fetchError}</div>
      )}
      {applyError && (
        <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">{applyError}</div>
      )}
      <div>
        <div className="flex-1">
          <div className="flex gap-6 mb-6 border-b border-slate-200 overflow-x-auto">{tabs.map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>{tab}{activeTab === tab ? <div className="absolute bottom-0 left-0 w-full h-0.5 rounded-t-full" style={{ backgroundColor: colors.primary }} /> : null}</button>))}</div>
          {isFetching ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 animate-pulse"><div className="h-6 bg-slate-100 rounded-full w-2/3 mb-4" /><div className="h-4 bg-slate-100 rounded-full w-full mb-2" /><div className="h-4 bg-slate-100 rounded-full w-5/6" /></div>))}</div>
          ) : (
            <div className="space-y-4">{filteredJobs.length > 0 ? filteredJobs.map((job) => {
              const jobId = String(job.id);
              const isApplied = activeTab === "Applied Jobs" || appliedJobIds.includes(jobId);
              const clientId = (job as any).client_id || job.client?.id;
              const budgetText = formatRupiahText(job.budget);
              
              const bidStatus = (job as any).bid_status;
              const contractStatus = (job as any).contract_status;
              
              let statusLabel = "";
              let statusColor = "";
              let statusDesc = "";
              
              if (activeTab === "Applied Jobs") {
                if (contractStatus === "completed") {
                  statusLabel = "DONE";
                  statusColor = "bg-blue-100 text-blue-700";
                } else if (contractStatus === "on_progress") {
                  statusLabel = "ON GOING";
                  statusColor = "bg-green-100 text-green-700";
                } else if (bidStatus === "rejected") {
                  statusLabel = "Ditolak";
                  statusColor = "bg-red-100 text-red-700";
                  statusDesc = "Anda belum diterima pada kesempatan ini. Tetap semangat mencari peluang lain ya!";
                } else {
                  statusLabel = "Applied";
                  statusColor = "bg-slate-100 text-slate-700";
                  statusDesc = "Lamaran Anda sedang ditinjau oleh klien.";
                }
              }

              return (
                <div key={jobId} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#8cbbed] transition-colors cursor-pointer" onClick={() => router.push(`/jobs/${jobId}`)}>{job.title}</h3>
                      {statusLabel && (
                        <div className="mt-2 flex flex-col gap-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${statusColor}`}>
                            STATUS: {statusLabel.toUpperCase()}
                          </span>
                          {statusDesc && <p className="text-[11px] text-slate-500 italic mt-1">{statusDesc}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><IconClock /> {job.type ?? "Project"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700">{budgetText === "Negotiable" ? budgetText : (<><span className="font-bold text-slate-700">Rp</span> {budgetText}</>)}</span>
                    <span>•</span>
                    <span>Est. Time: {job.duration ?? "TBD"}</span>
                  </div>
                  <p className="text-slate-600 mb-6 line-clamp-2 leading-relaxed text-sm cursor-pointer" onClick={() => router.push(`/jobs/${jobId}`)}>{job.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">{(job.skills ?? []).map((skill: string) => (<Badge key={skill} text={skill} type="default" />))}</div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-sm flex-1">
                      <span className="flex items-center gap-1 text-slate-500"><IconMapPin /> {job.client?.location ?? (job as unknown as Record<string, string>).location ?? "Remote"}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (!clientId) {
                            setApplyError("Informasi client tidak ditemukan");
                            return;
                          }
                          handleApplyJob(job.id, clientId, job.title);
                        }} 
                        disabled={applyingJobId === job.id || isApplied} 
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed ${isApplied ? "bg-slate-200 text-slate-600 cursor-default" : "bg-[#8cbbed] text-white hover:bg-[#7aabdb] disabled:opacity-50"}`}
                      >
                        {applyingJobId === job.id ? "Applying..." : isApplied ? "Applied" : "Apply"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }) : (<div className="text-center py-20 bg-white rounded-3xl border border-slate-200"><h3 className="text-lg font-bold text-slate-800 mb-2">No jobs found</h3></div>)}</div>
          )}
        </div>
      </div>
    </div>
  );
  };

  