"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { mockJobs, mockUser, colors } from "../data";
import type { Job } from "../types";
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
} from "../icons";
import { Badge, Button, CustomModal, Rating } from "../ui";

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

const navItems = [
  { href: "/home", label: "Find Work", icon: IconBriefcase },
  { href: "/post-job", label: "Post a Job", icon: IconPlus },
  { href: "/my-jobs", label: "My Jobs", icon: IconCheckCircle },
  { href: "/messages", label: "Messages", icon: IconMessage },
  { href: "/profile", label: "Profile", icon: IconUser },
];

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isLanding = pathname === "/";

  const filteredNavItems = navItems;

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isLanding ? "bg-white py-4" : "bg-white/80 backdrop-blur-md shadow-sm py-2 border-b border-slate-100"}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-14">
        <button type="button" className="flex items-center cursor-pointer group shrink-0 text-left" onClick={() => router.push(isLanding ? "/" : "/home")}> 
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-inner transform group-hover:rotate-12 transition-transform" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
            <span className="text-white font-black text-xl">F</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight hidden sm:block" style={{ color: colors.textMain }}>
            Lock<span style={{ color: colors.primary }}>In</span>
          </span>
        </button>

        {!isLanding ? (
          <div className="hidden md:flex items-center space-x-1 bg-slate-50 p-1 rounded-full border border-slate-100 flex-nowrap overflow-x-auto hide-scrollbar">
            {filteredNavItems.map((tab) => (
              <button key={tab.href} onClick={() => router.push(tab.href)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${pathname === tab.href ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"}`} style={{ color: pathname === tab.href ? colors.primary : "" }}>
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-4 shrink-0">
          {isLanding && !user ? (
            <>
              <Button variant="ghost" onClick={() => router.push("/login")} className="hidden sm:flex">Log In</Button>
              <Button variant="primary" onClick={() => router.push("/register")}>Sign Up</Button>
            </>
          ) : user ? (
            <div className="flex items-center gap-3">
              {isLanding && (
                <Button variant="ghost" onClick={() => router.push("/home")} className="hidden sm:flex">Find Work</Button>
              )}
              <div className="relative group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-md border-2 border-white hover:ring-2 transition-all" style={{ backgroundColor: colors.primary }} onClick={() => router.push("/profile")}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-lg border border-slate-100 p-2 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <p className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{user.name}</p>
                  <button onClick={() => router.push("/profile")} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">Profile Saya</button>
                  <button onClick={() => { logout(); router.push("/"); }} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">Keluar</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.push("/login")} className="hidden sm:flex">Log In</Button>
              <Button variant="primary" onClick={() => router.push("/register")}>Sign Up</Button>
            </>
          )}
        </div>
      </div>
    </div>
    </nav>
  );
};

export const LandingPage = () => {
  const router = useRouter();

  return (
  <div className="min-h-screen pt-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 flex flex-col lg:flex-row items-center gap-12">
      <div className="lg:w-1/2 flex flex-col items-start text-left z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-white shadow-sm border border-slate-100 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-semibold text-slate-700">Trusted by 10,000+ businesses</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Find the perfect <br />
          <span style={{ color: colors.primary, position: "relative" }}>
            freelance talent
            <svg className="absolute w-full h-3 -bottom-1 left-0 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke={colors.secondary} strokeWidth="4" fill="none" />
            </svg>
          </span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Connect with top-tier professionals across the globe. From development to design, get your projects done faster and better.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Button size="lg" onClick={() => router.push("/home")}>Find Talent</Button>
          <Button size="lg" variant="outline" onClick={() => router.push("/home")}>Find Work</Button>
        </div>
      </div>

      <div className="lg:w-1/2 relative w-full aspect-square max-w-125 lg:max-w-none animate-fade-in mx-auto flex items-center justify-center mt-12 lg:mt-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob" style={{ backgroundColor: colors.secondary }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-2000" style={{ backgroundColor: colors.primary }} />
        <div className="relative w-full max-w-105">
          <div className="relative z-10 bg-white/95 backdrop-blur-xl border border-slate-100 p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transform hover:-translate-y-1 transition-transform duration-500">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xl">JS</div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Senior React Developer</h3>
                <p className="text-sm text-slate-500">Rp 400.000/jam • Top Rated</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-3 bg-slate-100 rounded-full w-3/4" />
              <div className="h-3 bg-slate-100 rounded-full w-full" />
              <div className="h-3 bg-slate-100 rounded-full w-5/6" />
            </div>
            <div className="mt-6 flex gap-2">
              <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">React</span>
              <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">Node.js</span>
            </div>
          </div>
          <div className="absolute -left-4 md:-left-12 top-[20%] z-20 bg-white px-5 py-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] border border-slate-50 animate-float flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 border border-green-100"><IconCheckCircle /></div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Job Completed</p>
              <p className="text-xs text-slate-500">5 mins ago</p>
            </div>
          </div>
          <div className="absolute -right-4 md:-right-12 bottom-[15%] z-20 bg-white px-5 py-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] border border-slate-50 animate-float animation-delay-2000 flex items-center gap-3">
            <div className="text-[#8cbbed] font-bold text-lg px-2 bg-blue-50 rounded-lg">Rp</div>
            <div>
              <p className="font-bold text-slate-800 text-sm">15.000.000</p>
              <p className="text-xs text-slate-500">Payment Released</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-slate-50/50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Why choose LockIn?</h2>
          <p className="text-lg text-slate-600">We provide a secure, efficient, and transparent platform for both freelancers and clients to thrive.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Proof of Quality", desc: "Check any pro’s work samples, client reviews, and identity verification.", icon: () => <IconStar filled />, color: "text-amber-500", bg: "bg-amber-100" },
            { title: "Safe and Secure", desc: "Focus on your work knowing we help protect your data and privacy.", icon: IconShieldCheck, color: "text-blue-500", bg: "bg-blue-100" },
            { title: "No Cost Until You Hire", desc: "Interview potential fits, negotiate rates, and only pay for approved work.", icon: IconWallet, color: "text-green-500", bg: "bg-green-100" },
          ].map((feature, index) => (
            <div key={index} className="p-8 rounded-3xl border border-slate-200/60 hover:border-[#8cbbed]/50 hover:shadow-xl hover:shadow-[#8cbbed]/10 transition-all duration-300 bg-white group">
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};

export const HomePage = () => {
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
          setApiJobs(mockJobs as unknown as Job[]);
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
        const job = apiJobs.find(j => j.id === jobId) || mockJobs.find(j => j.id === jobId);
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

  const jobsSource = apiJobs.length > 0 ? apiJobs : (mockJobs as unknown as Job[]);
  const visibleJobs = jobsSource.filter((job) => {
    // Only show jobs that are still open
    if (job.status && job.status !== "open" && job.status !== "Active") return false;
    
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
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

  export const JobDetailPage = ({ job }: { job: Job | null }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const router = useRouter();
  const { user, token } = useAuth();

  const isJobOpen = !job?.status || job.status === "open" || job.status === "Active";

  if (!job) return null;

  // Check if job is saved or applied on component mount
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
      console.log('Applied status check for job', job.id, ':', data);
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

      // Create a formal bid as well
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
  
  // Safe access to job properties with defaults
  const jobTitle = job?.title || 'Job Title';
  const jobType = job?.type || 'Project';
  const jobDuration = job?.duration || 'TBD';
  const jobBudget = formatRupiahText(job?.budget);
  const jobDescription = job?.description || 'No description provided';
  const jobSkills = Array.isArray(job?.skills) ? job.skills : [];
  
  const clientName = job?.client?.name || 'Unknown Client';
  const clientRating = job?.client?.rating || 0;
  const clientLocation = job?.client?.location || 'Remote';
  const clientVerified = job?.client?.verified ?? true;

  // Check if job is ON GOING based on contract status
  const isOnGoing = (job as any)?.contract_status === 'on_progress';
  const isDone = (job as any)?.contract_status === 'completed';
  const isRejected = (job as any)?.bid_status === 'rejected';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
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
            <div className="flex flex-wrap gap-2 mb-2">{jobSkills.length > 0 ? jobSkills.map((skill) => (<Badge key={skill} text={skill} type="primary" />)) : <p className="text-slate-500 text-sm">No specific skills required</p>}</div>
          </div>
        </div>
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
            <Button 
              variant="primary" 
              className={`w-full mb-4 ${isApplied ? "bg-slate-200 text-slate-600 hover:bg-slate-200 border-none" : ""}`} 
              onClick={handleApplyJob} 
              disabled={isApplying || isApplied}
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
                <div>
                  <p className="font-semibold text-slate-800">{clientName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Rating score={clientRating} />
                    <span className="text-xs text-slate-500">(12 reviews)</span>
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
