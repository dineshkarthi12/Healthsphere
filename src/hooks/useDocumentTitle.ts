import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · HealthSphere` : "HealthSphere — Specialized Care. For Every Part of You.";
  }, [title]);
}
