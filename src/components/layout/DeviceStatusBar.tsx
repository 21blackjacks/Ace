import { BatteryFull, Signal, Wifi } from "lucide-react";

export function DeviceStatusBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto flex h-10 w-full max-w-[430px] items-center justify-between px-7 pt-2 text-sm font-black text-white">
      <span>9:41</span>
      <div className="absolute left-1/2 top-2 h-7 w-28 -translate-x-1/2 rounded-full bg-black/90" />
      <div className="flex items-center gap-1.5">
        <Signal size={17} fill="currentColor" />
        <Wifi size={17} />
        <BatteryFull size={20} />
      </div>
    </div>
  );
}
