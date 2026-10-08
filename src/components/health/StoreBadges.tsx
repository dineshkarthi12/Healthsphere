import { useToast } from "@/components/ui/overlays";
import { cn } from "@/lib/utils";

/** App Store / Google Play badges (prototype — links show a toast). */
export function StoreBadges({ className }: { className?: string }) {
  const { toast } = useToast();
  const onClick = (store: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    toast({ kind: "info", title: `${store} link`, description: "The HealthSphere app is a prototype — store listings aren't live yet." });
  };
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <a href="#" onClick={onClick("App Store")} className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-ink-900 px-4 text-white transition-colors hover:bg-ink-800" aria-label="Download on the App Store">
        <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
          <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.75 2.2 1.1-.04 1.52-.71 2.85-.71s1.7.71 2.87.69c1.19-.02 1.94-1.08 2.66-2.14.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.31-3.54zM14.18 6.13c.61-.74 1.02-1.76.91-2.78-.88.04-1.94.58-2.57 1.32-.56.65-1.06 1.69-.92 2.69.98.08 1.97-.5 2.58-1.23z" />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[0.625rem] opacity-80">Download on the</span>
          <span className="block text-small font-semibold">App Store</span>
        </span>
      </a>
      <a href="#" onClick={onClick("Google Play")} className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-ink-900 px-4 text-white transition-colors hover:bg-ink-800" aria-label="Get it on Google Play">
        <svg viewBox="0 0 24 24" className="size-5.5" aria-hidden="true">
          <path fill="#34A853" d="M3.6 2.3 13.4 12l-9.8 9.7c-.3-.2-.5-.6-.5-1V3.3c0-.4.2-.8.5-1z" />
          <path fill="#FBBC04" d="m16.8 15.4-3.4-3.4 3.4-3.4 3.8 2.2c.9.5.9 1.8 0 2.4z" />
          <path fill="#EA4335" d="M13.4 12 3.6 21.7c.3.3.9.4 1.4.1l11.8-6.4z" />
          <path fill="#4285F4" d="M13.4 12 16.8 8.6 5 2.2c-.5-.3-1.1-.2-1.4.1z" />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[0.625rem] opacity-80">Get it on</span>
          <span className="block text-small font-semibold">Google Play</span>
        </span>
      </a>
    </div>
  );
}
