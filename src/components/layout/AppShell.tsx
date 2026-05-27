import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DeviceStatusBar } from "./DeviceStatusBar";
import { Toast } from "./Toast";

export function AppShell() {
  return (
    <main className="min-h-screen bg-ace-bg text-ace-text">
      <div className="relative isolate mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden border-x border-white/10 bg-[radial-gradient(circle_at_top,_rgba(47,128,255,0.18),_transparent_34%),radial-gradient(circle_at_80%_18%,_rgba(139,92,246,0.12),_transparent_28%),linear-gradient(180deg,#071126_0%,#050B1E_62%)] shadow-ace-glow">
        <DeviceStatusBar />
        <div className="flex-1 pb-24">
          <Outlet />
        </div>
        <BottomNav />
        <Toast />
      </div>
    </main>
  );
}
