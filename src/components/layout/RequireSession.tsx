import { Lock, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAppState } from "@/lib/store";
import { useToast } from "@/components/ui/overlays";

/**
 * Patient-only screens. In this prototype anyone can continue with the demo
 * patient account (mock data only — no real health information).
 */
export function RequireSession({ children, title = "Sign in to view your care" }: { children: React.ReactNode; title?: string }) {
  const { signedIn, signIn } = useAppState();
  const { toast } = useToast();
  const { pathname } = useLocation();
  if (signedIn) return <>{children}</>;
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-6 text-center sm:p-8">
        <span className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <Lock className="size-6.5" aria-hidden="true" />
        </span>
        <h1 className="t-h2">{title}</h1>
        <p className="mt-2 text-small text-ink-500">Your appointments, records and care journeys are private. Sign in to continue.</p>
        <div className="mt-6 grid gap-2">
          <Button
            size="lg"
            onClick={() => {
              signIn();
              toast({ title: "Welcome back, Priya", description: "You're using the HealthSphere demo account." });
            }}
          >
            Continue with demo account
          </Button>
          <ButtonLink to={`/login?next=${encodeURIComponent(pathname)}`} variant="outline" size="lg">
            Sign in with phone or email
          </ButtonLink>
        </div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-caption text-ink-500">
          <ShieldCheck className="size-4 text-success-700" aria-hidden="true" />
          Demo data only. No real medical records are connected.
        </p>
      </div>
    </div>
  );
}
