"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  embedUrl: string;
}

/**
 * Wide, 16:9 video lightbox for a deliberately-opened YouTube embed
 * (as opposed to the Modal component's form-sized dialog). Shared by
 * the homepage hero's "Watch Full Worship & Sermons" button and the
 * Washington, D.C. spotlight section's gallery play button.
 */
export function VideoModal({ isOpen, onClose, title, closeLabel, embedUrl }: VideoModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 bg-black/80"
      />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-4xl">
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
          <iframe
            key={embedUrl}
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
