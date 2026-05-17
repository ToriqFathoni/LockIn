"use client";

import { colors } from "../freelance-hub/data";
import { IconStar } from "../freelance-hub/icons";

export const Rating = ({ score }: { score: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, index) => (
      <span key={index} className="relative inline-flex h-4 w-4">
        <IconStar className="absolute inset-0 text-slate-200" />
        <span className="absolute inset-0 overflow-hidden" style={{ width: `${Math.max(0, Math.min(1, score - index)) * 100}%` }}>
          <IconStar filled />
        </span>
      </span>
    ))}
    <span className="text-sm font-semibold ml-1" style={{ color: colors.textMain }}>
      {score}
    </span>
  </div>
);
