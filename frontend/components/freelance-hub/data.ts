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
    title: "SEO Specialist for B2B SaaS",
    description:
      "Need help ranking our B2B software higher on Google for competitive enterprise keywords.",
    budget: "Rp 12.000.000/bulan",
    client: {
      id: 103,
      name: "CloudSync",
      rating: 4.5,
      verified: false,
      location: "Surabaya",
    },
    skills: ["Technical SEO", "Content Strategy", "Link Building"],
    postedAt: "1 day ago",
    type: "Retainer",
    duration: "Ongoing",
    status: "OPEN",
  },
  {
    id: 4,
    title: "Python Data Engineer for Scraping",
    description:
      "I need a robust Python script to extract product data from several major retail websites daily.",
    budget: "Rp 7.500.000 - Rp 12.000.000",
    client: {
      id: 104,
      name: "MarketIntel",
      rating: 4.2,
      verified: true,
      location: "Yogyakarta",
    },
    skills: ["Python", "Web Scraping", "BeautifulSoup", "PostgreSQL"],
    postedAt: "2 days ago",
    type: "Fixed Price",
    duration: "Less than 1 month",
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
  jobSuccess: "98%",
  totalEarned: "Rp 150.000.000+",
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
