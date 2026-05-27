import { useEffect } from "react";
import { useAppStore } from "../../store/appStore";

export function Toast() {
  const toast = useAppStore((state) => state.toast);
  const clearToast = useAppStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, 2600);
    return () => window.clearTimeout(timer);
  }, [clearToast, toast]);

  if (!toast) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-50 mx-auto w-full max-w-[430px] px-5">
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#101B38]/95 px-4 py-3 text-sm font-bold text-ace-text shadow-ace-glow backdrop-blur-xl">
        <span>{toast.message}</span>
        {toast.actionLabel ? <span className="shrink-0 text-ace-cyan">{toast.actionLabel}</span> : null}
      </div>
    </div>
  );
}
