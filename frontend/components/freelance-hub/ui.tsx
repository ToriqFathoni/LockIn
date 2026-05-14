"use client";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { colors } from "./data";
import { IconCheckCircle, IconStar } from "./icons";

type BadgeType = "default" | "primary" | "success";

interface BadgeProps {
  text: string;
  type?: BadgeType;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
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

export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  size = "md",
  type = "button",
  style = {},
  ...rest
}: ButtonProps) => {
  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-2.5",
    lg: "px-8 py-3.5 text-lg font-bold",
  };

  const baseStyle =
    "rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap";

  const getVariantStyles = (): CSSProperties => {
    switch (variant) {
      case "primary":
        return {
          background: `linear-gradient(135deg, ${colors.primary}, #60a5fa)`,
          color: colors.white,
          boxShadow: "0 4px 14px 0 rgba(140, 187, 237, 0.39)",
        };
      case "secondary":
        return {
          backgroundColor: colors.secondary,
          color: colors.textMain,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          border: `2px solid ${colors.primary}`,
          color: colors.primary,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: colors.textMuted,
        };
      default:
        return {};
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${sizes[size]} hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${className} ${
        variant === "ghost" ? "hover:text-slate-800 hover:bg-slate-50" : ""
      }`}
      style={{ ...getVariantStyles(), ...style }}
      {...rest}
    >
      {children}
    </button>
  );
};

export const Rating = ({ score }: { score: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, index) => (
      <IconStar key={index} filled={index < Math.floor(score)} />
    ))}
    <span className="text-sm font-semibold ml-1" style={{ color: colors.textMain }}>
      {score}
    </span>
  </div>
);

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const CustomModal = ({
  isOpen,
  onClose,
  title,
  message,
  actionText,
  onAction,
}: CustomModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in-up">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6">
          <IconCheckCircle />
        </div>
        <h3 className="text-xl font-bold text-slate-800 text-center mb-2">{title}</h3>
        <p className="text-slate-600 text-center mb-8 text-sm">{message}</p>
        <div className="flex flex-col gap-3">
          {actionText ? (
            <Button
              variant="primary"
              onClick={() => {
                onAction?.();
                onClose();
              }}
              className="w-full"
            >
              {actionText}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={onClose} className="w-full">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
