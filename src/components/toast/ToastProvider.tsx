"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  variant: ToastVariant;
  message: string;
  leaving?: boolean;
};

type ShowToastOptions = {
  variant: ToastVariant;
  message: string;
  duration?: number;
};

type ToastContextValue = {
  toast: (opts: ShowToastOptions) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function newToastId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

function toastStyles(variant: ToastVariant): string {
  switch (variant) {
    case "success":
      return "border-emerald-200/90 bg-emerald-50/95 text-emerald-950";
    case "error":
      return "border-red-200/90 bg-red-50/95 text-red-950";
    default:
      return "border-[var(--border)] bg-white/95 text-[var(--ink)]";
  }
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const ring = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg";
  if (variant === "success") {
    return (
      <span className={`${ring} bg-emerald-500/15 text-emerald-700`} aria-hidden>
        ✓
      </span>
    );
  }
  if (variant === "error") {
    return (
      <span className={`${ring} bg-red-500/15 text-red-700`} aria-hidden>
        !
      </span>
    );
  }
  return (
    <span className={`${ring} bg-[var(--accent-deep)]/10 text-[var(--accent-deep)]`} aria-hidden>
      i
    </span>
  );
}

function ToastRow({
  item,
  onDismiss,
  onLeaveEnd,
}: {
  item: ToastItem;
  onDismiss: () => void;
  onLeaveEnd: () => void;
}) {
  const live = item.variant === "error" ? "assertive" : "polite";
  const role = item.variant === "error" ? "alert" : "status";

  return (
    <div
      role={role}
      aria-live={live}
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_12px_40px_rgba(12,18,34,0.12)] backdrop-blur-md ${toastStyles(item.variant)} ${item.leaving ? "nadee-toast-leave" : "nadee-toast-enter"}`}
      onAnimationEnd={(e) => {
        const anim = String(e.animationName ?? "");
        if (item.leaving && anim.includes("nadee-toast-leave")) {
          onLeaveEnd();
        }
      }}
    >
      <ToastIcon variant={item.variant} />
      <p className="min-w-0 flex-1 pt-1 text-sm font-medium leading-snug">{item.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 text-current opacity-60 transition hover:bg-black/5 hover:opacity-100"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

const DEFAULT_DURATION = 4800;
const MAX_VISIBLE = 5;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeFromDom = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
    }
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
    setToasts((prev) =>
      prev.map((x) => (x.id === id ? { ...x, leaving: true } : x)),
    );
  }, []);

  const toast = useCallback(
    ({
      variant,
      message,
      duration = DEFAULT_DURATION,
    }: ShowToastOptions) => {
      const trimmed = message.trim();
      if (!trimmed) {
        return;
      }
      const id = newToastId();
      setToasts((prev) => {
        let base = prev;
        if (prev.length >= MAX_VISIBLE) {
          const dropped = prev[0];
          const oldTid = timers.current.get(dropped.id);
          if (oldTid) {
            clearTimeout(oldTid);
          }
          timers.current.delete(dropped.id);
          base = prev.slice(1);
        }
        return [...base, { id, variant, message: trimmed }];
      });
      const tid = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, tid);
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string, duration?: number) =>
      toast({ variant: "success", message, duration }),
    [toast],
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      toast({ variant: "error", message, duration: duration ?? 6400 }),
    [toast],
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      toast({ variant: "info", message, duration }),
    [toast],
  );

  const value = useMemo(
    () => ({ toast, success, error, info, dismiss }),
    [toast, success, error, info, dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((tid) => clearTimeout(tid));
      pending.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed top-4 right-4 z-[10000] flex w-[min(calc(100vw-2rem),22rem)] flex-col gap-3 sm:top-6 sm:right-6"
        aria-label="Notifications"
      >
        {toasts.map((item) => (
          <ToastRow
            key={item.id}
            item={item}
            onDismiss={() => dismiss(item.id)}
            onLeaveEnd={() => removeFromDom(item.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
