"use client";

import { Printer } from "lucide-react";

/** `window.print()` trigger for the official tax receipt — a Server
 *  Component page can't attach an `onClick`, so this is the one client
 *  island on `/give/success`. */
export function PrintReceiptButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 print:hidden"
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
