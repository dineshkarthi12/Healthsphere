import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@fontsource-variable/plus-jakarta-sans";
import "./index.css";
import { router } from "./routes";
import { AppStateProvider } from "./lib/store";
import { ToastProvider } from "./components/ui/overlays";
import { PageSkeleton } from "./components/layout/PageSkeleton";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppStateProvider>
      <ToastProvider>
        <Suspense fallback={<PageSkeleton />}>
          <RouterProvider router={router} future={{ v7_startTransition: true }} />
        </Suspense>
      </ToastProvider>
    </AppStateProvider>
  </StrictMode>,
);
