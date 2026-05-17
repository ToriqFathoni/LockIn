"use client";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { colors } from "../freelance-hub/data";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}

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
