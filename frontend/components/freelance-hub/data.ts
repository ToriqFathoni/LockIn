import type { ColorPalette, Job, MessageItem, UserProfile } from "./types";

export const colors: ColorPalette = {
  bgLight: "#fdf7d6",
  accentLight: "#faebd7",
  secondary: "#b9dbf4",
  primary: "#8cbbed",
  textMain: "#1e293b",
  textMuted: "#64748b",
  white: "#ffffff",
};

export const mockJobs: Job[] = [
  {
    id: 1,
    title: "Fullstack Developer for E-commerce MVP",
    description:
      "Looking for an experienced fullstack developer (React/Node.js) to build a Minimum Viable Product for a new e-commerce platform. Needs to handle user auth, product listing, and basic cart functionality.",
    budget: "Rp 20.000.000 - Rp 45.000.000",
    client: {
      id: 101,
      name: "TechNova Inc.",
      rating: 4.8,
      verified: true,
      location: "Jakarta Selatan",
    },
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    postedAt: "2 hours ago",
    type: "Fixed Price",
    duration: "1-3 months",
    status: "OPEN",
  },
  {
    id: 2,
    title: "Senior UI/UX Designer for Fintech App",
    description:
      "We need a complete redesign of our existing mobile app. The goal is to modernize the look and feel, improve user retention, and simplify the onboarding process.",
    budget: "Rp 500.000 - Rp 800.000 / jam",
    client: {
      id: 102,
      name: "FinFlow Solutions",
      rating: 4.9,
      verified: true,
      location: "Bandung",
    },
    skills: ["Figma", "UI/UX", "Mobile Design", "Prototyping"],
    postedAt: "5 hours ago",
    type: "Hourly",
    duration: "3-6 months",
    status: "OPEN",
  },
  {
    id: 3,
    title: "Membangun API E-Commerce",
    description:
      "Butuh bantuan untuk membangun API E-Commerce lengkap dengan Node.js dan Express.",
    budget: "Rp 5000000",
    client: {
      id: 1,
      name: "Budi Santoso",
      rating: 5.0,
      verified: true,
      location: "Jakarta",
    },
    skills: ["PostgreSQL", "Javascript", "Node.js"],
    postedAt: "1 day ago",
    type: "Fixed Price",
    duration: "20 - 30 Day(s)",
    status: "OPEN",
  },
  {
    id: 4,
    title: "Pembuatan UI Dashboard Fintech",
    description:
      "Kami mencari desainer yang bisa merombak dashboard admin Fintech kami menggunakan React dan Tailwind.",
    budget: "Rp 8000000",
    client: {
      id: 1,
      name: "Budi Santoso",
      rating: 5.0,
      verified: true,
      location: "Jakarta",
    },
    skills: ["React", "UI/UX Design", "Tailwind CSS"],
    postedAt: "2 days ago",
    type: "Fixed Price",
    duration: "2 - 3 Month(s)",
    status: "OPEN",
  },
];

export const mockUser: UserProfile = {
  id: 1,
  name: "Budi Santoso",
  role: "FREELANCER",
  title: "Senior Frontend Developer | React & Vue Expert",
  bio:
    "Passionate about creating beautiful, accessible, and highly performant web applications. 5+ years of experience in JavaScript ecosystem. I specialize in turning complex UI/UX designs into pixel-perfect code.",
  skills: ["JavaScript", "React", "TypeScript", "Tailwind CSS", "Next.js"],
  hourlyRate: "Rp 350.000/jam",
  location: "Jakarta, Indonesia",
  rating: 4.8,
  reviewCount: 126,
  totalEarned: "Rp 150.000.000+",
  experience: "5+ years in frontend engineering across agency and product teams.",
  achievements: ["Built 20+ client projects", "Maintained 99% delivery rate"],
  cvFileName: "Budi-Santoso-CV.pdf",
};

export const mockMessages: MessageItem[] = [
  {
    id: 1,
    sender: "TechNova Inc.",
    text: "Hi Budi, we loved your portfolio. Do you have capacity to start next week?",
    time: "10:00 AM",
    isMine: false,
    avatar: "T",
  },
  {
    id: 2,
    sender: "Budi Santoso",
    text: "Hello! Thank you. Yes, my schedule is opening up starting next Monday. I'd love to hear more about the specific features needed for the MVP.",
    time: "10:15 AM",
    isMine: true,
    avatar: "B",
  },
];
