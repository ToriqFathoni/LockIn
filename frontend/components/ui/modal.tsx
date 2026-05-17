"use client";

import { IconCheckCircle } from "../freelance-hub/icons";
import { Button } from "./button";

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
