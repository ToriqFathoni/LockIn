export type PageKey =
  | "landing"
  | "home"
  | "postJob"
  | "myJobs"
  | "jobDetail"
  | "messages"
  | "profile"
  | "manageJob";

export interface ClientProfile {
  id: number;
  name: string;
  rating: number;
  verified: boolean;
  location: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  budget: string;
  client: ClientProfile;
  skills: string[];
  postedAt: string;
  type: string;
  duration: string;
  status: "OPEN" | "CLOSED";
}

export interface UserProfile {
  id: number;
  name: string;
  role: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: string;
  location: string;
  jobSuccess: string;
  totalEarned: string;
}

export interface MessageItem {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMine: boolean;
  avatar: string;
}

export interface ColorPalette {
  bgLight: string;
  accentLight: string;
  secondary: string;
  primary: string;
  textMain: string;
  textMuted: string;
  white: string;
}
