"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
}

/**
 * Shared accessible modal shell (backdrop + Escape-to-close + focus-visible
 * close button) used by the event RSVP and ministry contact forms, so both
 * get identical keyboard/ARIA behavior instead of two slightly different
 * implementations.
 */
export function Modal({ isOpen, onClose, title, closeLabel, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 bg-navy-950/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[90dvh] w-full max-w-lg flex-col overflow-y-auto overscroll-contain rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl sm:rounded-2xl sm:pb-0"
      >
        <span aria-hidden="true" className="mx-auto mb-1 mt-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-300 sm:hidden" />
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-white px-6 pb-4 pt-2 sm:static sm:pt-6">
          <h2 className="font-display text-lg font-bold text-navy-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-lg text-slate-500 transition-transform active:scale-[0.98] hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
