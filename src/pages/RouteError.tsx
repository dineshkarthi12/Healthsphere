import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

/** Last-resort boundary for route errors (e.g. a failed chunk load). */
export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
      <Link to="/" aria-label="HealthSphere home"><Logo /></Link>
      <div className="card max-w-md p-8">
        <span className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-danger-50 text-danger-600">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </span>
        <h1 className="t-h2">{notFound ? "Page not found" : "Something went wrong"}</h1>
        <p className="mt-2 text-ink-500">
          {notFound ? "The page you're looking for doesn't exist." : "We hit an unexpected problem loading this page. Your information is safe."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => window.location.reload()} className="inline-flex h-11 items-center rounded-md border border-line-strong bg-white px-4 font-semibold text-ink-800 hover:bg-subtle">Reload</button>
          <Link to="/" className="inline-flex h-11 items-center rounded-md bg-primary-600 px-4 font-semibold text-white hover:bg-primary-700">Go home</Link>
        </div>
      </div>
      <p className="text-small text-ink-500">Medical emergency? Call <strong>108</strong> or <strong>112</strong>.</p>
    </div>
  );
}
