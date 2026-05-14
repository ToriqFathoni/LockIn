"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { mockJobs, mockUser, colors } from "../data";
import type { Job } from "../types";
import {
  IconBriefcase,
  IconCheckCircle,
  IconClock,
  IconDollar,
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
  const isLanding = pathname === "/";

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
            {navItems.map((tab) => (
              <button key={tab.href} onClick={() => router.push(tab.href)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${pathname === tab.href ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"}`} style={{ color: pathname === tab.href ? colors.primary : "" }}>
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-4 shrink-0">
          {isLanding ? (
            <>
              <Button variant="ghost" onClick={() => router.push("/home")} className="hidden sm:flex">Log In</Button>
              <Button variant="primary" onClick={() => router.push("/home")}>Sign Up</Button>
            </>
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-md border-2 border-white hover:ring-2 transition-all" style={{ backgroundColor: colors.primary }} onClick={() => router.push("/profile") }>
              {mockUser.name.charAt(0)}
            </div>
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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Recommended Jobs");
  const filteredJobs = mockJobs.filter((job) => job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 w-full md:w-auto">Find Work</h1>
        <div className="relative w-full md:w-100">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><IconSearch /></div>
          <input type="text" placeholder="Search for jobs or skills..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-700" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="hidden lg:block w-64 shrink-0">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Filters</h3>
            <div className="space-y-6"><div><h4 className="font-semibold text-slate-700 mb-3 text-sm">Job Type</h4><label className="flex items-center gap-3 mb-2 cursor-pointer"><input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4" defaultChecked /><span className="text-slate-600 text-sm">Fixed Price</span></label><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4" defaultChecked /><span className="text-slate-600 text-sm">Hourly Rate</span></label></div></div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex gap-6 mb-6 border-b border-slate-200">{["Recommended Jobs", "Saved Jobs"].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === tab ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>{tab}{activeTab === tab ? <div className="absolute bottom-0 left-0 w-full h-0.5 rounded-t-full" style={{ backgroundColor: colors.primary }} /> : null}</button>))}</div>
          <div className="space-y-4">{filteredJobs.length > 0 ? filteredJobs.map((job) => (<div key={job.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 cursor-pointer group" onClick={() => router.push(`/jobs/${job.id}`)}><div className="flex justify-between items-start mb-2"><h3 className="text-xl font-bold text-slate-800 group-hover:text-[#8cbbed] transition-colors">{job.title}</h3></div><div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-slate-500 mb-4"><span className="flex items-center gap-1"><IconClock /> {job.type}</span><span>•</span><span className="flex items-center gap-1 text-slate-700"><IconDollar /> {job.budget}</span><span>•</span><span>Est. Time: {job.duration}</span></div><p className="text-slate-600 mb-6 line-clamp-2 leading-relaxed text-sm">{job.description}</p><div className="flex flex-wrap gap-2 mb-6">{job.skills.map((skill) => (<Badge key={skill} text={skill} type="default" />))}</div><div className="flex items-center justify-between pt-4 border-t border-slate-100"><div className="flex items-center gap-3 text-sm">{job.client.verified ? (<span className="flex items-center gap-1 text-green-600 font-medium"><IconCheckCircle /> Payment verified</span>) : (<span className="text-slate-500 font-medium">Payment unverified</span>)}<span className="text-slate-300">|</span><Rating score={job.client.rating} /><span className="text-slate-300">|</span><span className="flex items-center gap-1 text-slate-500"><IconMapPin /> {job.client.location}</span></div><span className="text-xs text-slate-400">{job.postedAt}</span></div></div>)) : (<div className="text-center py-20 bg-white rounded-3xl border border-slate-200"><h3 className="text-lg font-bold text-slate-800 mb-2">No jobs found</h3></div>)}</div>
        </div>
      </div>
    </div>
  );
  };

  export const JobDetailPage = ({ job }: { job: Job | null }) => {
  const [modalOpen, setModalOpen] = useState(false);
    const router = useRouter();
  if (!job) return null;
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <CustomModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Proposal Terkirim!" message={`Proposal Anda untuk pekerjaan "${job.title}" telah berhasil dikirim ke klien.`} actionText="Lihat Pesan Saya" onAction={() => router.push("/messages")} />
        <button onClick={() => router.push("/home")} className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold group"><span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Search</button>
      <div className="grid md:grid-cols-3 gap-8"><div className="md:col-span-2 space-y-6"><div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"><h1 className="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">{job.title}</h1><div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-slate-100"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><IconClock /></div><div><p className="text-sm font-bold text-slate-800">{job.type}</p><p className="text-xs text-slate-500">{job.duration}</p></div></div><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600"><IconDollar /></div><div><p className="text-sm font-bold text-slate-800">{job.budget}</p><p className="text-xs text-slate-500">Budget</p></div></div></div><h3 className="text-lg font-bold text-slate-800 mb-4">Job Description</h3><p className="text-slate-700 leading-relaxed mb-8 whitespace-pre-line">{job.description}</p><h3 className="text-lg font-bold text-slate-800 mb-4">Skills and Expertise</h3><div className="flex flex-wrap gap-2 mb-2">{job.skills.map((skill) => (<Badge key={skill} text={skill} type="primary" />))}</div></div></div><div className="md:col-span-1 space-y-6"><div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24"><Button variant="primary" className="w-full mb-4" onClick={() => setModalOpen(true)}>Apply Now</Button><Button variant="outline" className="w-full mb-6">Save Job</Button><div className="pt-6 border-t border-slate-100"><h4 className="font-bold text-slate-800 mb-4">About the Client</h4><div className="space-y-4"><div><p className="font-semibold text-slate-800">{job.client.name}</p><div className="flex items-center gap-2 mt-1"><Rating score={job.client.rating} /><span className="text-xs text-slate-500">(12 reviews)</span></div></div><div><span className="flex items-center gap-2 text-sm text-slate-700"><IconMapPin /> {job.client.location}</span></div><div><span className="flex items-center gap-2 text-sm text-slate-700"><IconCheckCircle /> {job.client.verified ? "Payment Verified" : "Unverified"}</span></div></div></div></div></div></div>
    </div>
  );
};
