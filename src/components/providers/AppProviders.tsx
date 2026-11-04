"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Book Store Shopping Cart
// ---------------------------------------------------------------------------

export interface CartItem {
  bookId: string;
  titleEn: string;
  titleAm: string;
  format: "Print" | "PDF";
  priceUsd: number;
  quantity: number;
  coverImageUrl?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (bookId: string, format: CartItem["format"]) => void;
  updateQuantity: (bookId: string, format: CartItem["format"], quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotalUsd: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "glm_book_cart_v1";

function sameLineItem(a: Pick<CartItem, "bookId" | "format">, b: Pick<CartItem, "bookId" | "format">) {
  return a.bookId === b.bookId && a.format === b.format;
}

function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const hasHydrated = useRef(false);

  // Hydration safety: localStorage is only read client-side, after mount,
  // so the server-rendered and first client render both start empty and
  // never mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Corrupted or inaccessible storage — start from an empty cart.
    } finally {
      hasHydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (private browsing, quota) — fail silently.
    }
  }, [items]);

  const addItem = useCallback<CartContextValue["addItem"]>((item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((entry) => sameLineItem(entry, item));
      if (existing) {
        return prev.map((entry) =>
          sameLineItem(entry, item)
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback<CartContextValue["removeItem"]>((bookId, format) => {
    setItems((prev) => prev.filter((entry) => !sameLineItem(entry, { bookId, format })));
  }, []);

  const updateQuantity = useCallback<CartContextValue["updateQuantity"]>(
    (bookId, format, quantity) => {
      setItems((prev) => {
        if (quantity <= 0) {
          return prev.filter((entry) => !sameLineItem(entry, { bookId, format }));
        }
        return prev.map((entry) =>
          sameLineItem(entry, { bookId, format }) ? { ...entry, quantity } : entry
        );
      });
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const { totalItems, subtotalUsd } = useMemo(
    () =>
      items.reduce(
        (totals, item) => ({
          totalItems: totals.totalItems + item.quantity,
          subtotalUsd: totals.subtotalUsd + item.priceUsd * item.quantity,
        }),
        { totalItems: 0, subtotalUsd: 0 }
      ),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      totalItems,
      subtotalUsd,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, isCartOpen, totalItems, subtotalUsd]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within AppProviders");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Global Toast Notifications
// ---------------------------------------------------------------------------

export type ToastVariant = "success" | "error" | "info";

interface ToastRecord {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

const TOAST_ICON: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const TOAST_STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-700 bg-emerald-800 text-emerald-50",
  error: "border-red-700 bg-red-800 text-red-50",
  info: "border-navy-700 bg-navy-800 text-navy-50",
};

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback<ToastContextValue["showToast"]>(
    (message, variant = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      >
        {toasts.map((toast) => {
          const Icon = TOAST_ICON[toast.variant];
          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
                TOAST_STYLES[toast.variant]
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded p-0.5 text-current/80 hover:text-current"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within AppProviders");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Global Prayer Request Modal Controller
// ---------------------------------------------------------------------------

interface PrayerModalContextValue {
  isPrayerModalOpen: boolean;
  openPrayerModal: () => void;
  closePrayerModal: () => void;
}

const PrayerModalContext = createContext<PrayerModalContextValue | null>(null);

function PrayerModalProvider({ children }: { children: ReactNode }) {
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);

  const openPrayerModal = useCallback(() => setIsPrayerModalOpen(true), []);
  const closePrayerModal = useCallback(() => setIsPrayerModalOpen(false), []);

  const value = useMemo(
    () => ({ isPrayerModalOpen, openPrayerModal, closePrayerModal }),
    [isPrayerModalOpen, openPrayerModal, closePrayerModal]
  );

  return <PrayerModalContext.Provider value={value}>{children}</PrayerModalContext.Provider>;
}

/** Lets the Top Bar, Hero, Navbar, and Footer all open the same
 *  `GlobalPrayerModal` instance (rendered once in `[locale]/layout.tsx`)
 *  instead of each page owning its own modal state. */
export function usePrayerModal(): PrayerModalContextValue {
  const ctx = useContext(PrayerModalContext);
  if (!ctx) {
    throw new Error("usePrayerModal must be used within AppProviders");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Combined Provider
// ---------------------------------------------------------------------------

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <PrayerModalProvider>{children}</PrayerModalProvider>
      </CartProvider>
    </ToastProvider>
  );
}
