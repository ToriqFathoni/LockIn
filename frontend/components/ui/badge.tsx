"use client";

type BadgeType = "default" | "primary" | "success";

interface BadgeProps {
  text: string;
  type?: BadgeType;
}

export const Badge = ({ text, type = "default" }: BadgeProps) => {
  const styles: Record<BadgeType, string> = {
    default: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    primary: "bg-[#b9dbf4] bg-opacity-30 text-[#8cbbed] font-semibold",
    success: "bg-green-100 text-green-700",
  };

  return (
    <span className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${styles[type]}`}>
      {text}
    </span>
  );
};
