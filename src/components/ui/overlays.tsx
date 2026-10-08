import * as RDialog from "@radix-ui/react-dialog";
import * as RTabs from "@radix-ui/react-tabs";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ================================================================ Dialog
   Accessible modal (focus trap, Esc, aria-labelledby) via Radix.
   variant="sheet" renders as a bottom sheet on mobile and a centred
   dialog from the sm breakpoint up. */

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "dialog" | "sheet";
  size?: "sm" | "md" | "lg" | "xl";
  hideTitle?: boolean;
}

export function Modal({ open, onOpenChange, title, description, children, footer, variant = "dialog", size = "md", hideTitle }: ModalProps) {
  const width = { sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-2xl", xl: "sm:max-w-4xl" }[size];
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <RDialog.Content
          className={cn(
            "fixed z-50 flex max-h-[92dvh] w-full flex-col bg-white shadow-float focus:outline-none",
            variant === "sheet"
              ? "inset-x-0 bottom-0 rounded-t-3xl data-[state=open]:animate-sheet-up sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:data-[state=open]:animate-fade-in"
              : "top-1/2 left-1/2 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl data-[state=open]:animate-fade-in",
            width,
          )}
        >
          {variant === "sheet" && <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line-strong sm:hidden" aria-hidden="true" />}
          <div className={cn("flex items-start justify-between gap-4 px-5 pt-4 sm:px-6 sm:pt-5", hideTitle && "sr-only")}>
            <div>
              <RDialog.Title className="t-h3">{title}</RDialog.Title>
              {description && <RDialog.Description className="mt-1 text-small text-ink-500">{description}</RDialog.Description>}
            </div>
            <RDialog.Close className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-subtle hover:text-ink-900" aria-label="Close">
              <X className="size-5" aria-hidden="true" />
            </RDialog.Close>
          </div>
          {!description && <RDialog.Description className="sr-only">{title}</RDialog.Description>}
          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
          {footer && <div className="safe-bottom flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</div>}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

/* ================================================================== Tabs */

export const Tabs = ({ className, ...props }: RTabs.TabsProps) => <RTabs.Root className={cn("min-w-0", className)} {...props} />;
export const TabsContent = (props: RTabs.TabsContentProps) => (
  <RTabs.Content {...props} className={cn("focus-visible:outline-none data-[state=active]:animate-fade-in", props.className)} />
);

export function TabsList({ className, children, ...props }: RTabs.TabsListProps) {
  return (
    <RTabs.List
      className={cn("scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1 pb-px", className)}
      {...props}
    >
      {children}
    </RTabs.List>
  );
}

export function TabsTrigger({ className, variant = "pill", ...props }: RTabs.TabsTriggerProps & { variant?: "pill" | "underline" }) {
  return (
    <RTabs.Trigger
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 text-small font-semibold whitespace-nowrap text-ink-600 transition-colors hover:text-ink-900",
        variant === "pill"
          ? "rounded-full px-4 data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-[0_6px_14px_-8px_rgb(26_99_220/0.7)] data-[state=inactive]:hover:bg-subtle"
          : "border-b-2 border-transparent px-3 data-[state=active]:border-primary-600 data-[state=active]:text-primary-700",
        className,
      )}
      {...props}
    />
  );
}

/* ================================================================= Toast */

type ToastKind = "success" | "info" | "warning" | "error";
interface ToastItem {
  id: number;
  title: string;
  description?: string;
  kind: ToastKind;
}
interface ToastApi {
  toast: (t: Omit<ToastItem, "id" | "kind"> & { kind?: ToastKind }) => void;
}

const ToastCtx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const toast = useCallback<ToastApi["toast"]>(
    ({ kind = "success", ...t }) => {
      const id = ++counter.current;
      setItems((xs) => [...xs.slice(-2), { id, kind, ...t }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );
  const api = useMemo(() => ({ toast }), [toast]);

  const icons = { success: CheckCircle2, info: Info, warning: TriangleAlert, error: XCircle };
  const tones = { success: "text-success-700 bg-success-50", info: "text-primary-700 bg-primary-50", warning: "text-warning-700 bg-warning-50", error: "text-danger-700 bg-danger-50" };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 md:right-6 md:bottom-6 md:left-auto md:items-end"
        role="region"
        aria-label="Status messages"
      >
        <div aria-live="polite" aria-atomic="false" className="flex w-full flex-col items-center gap-2 md:items-end">
          {items.map((t) => {
            const Icon = icons[t.kind];
            return (
              <div
                key={t.id}
                role={t.kind === "error" ? "alert" : "status"}
                className="pointer-events-auto flex w-full max-w-sm animate-scale-in items-start gap-3 rounded-xl border border-line bg-white p-3.5 shadow-float"
              >
                <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg", tones[t.kind])}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-small font-semibold text-ink-900">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-small text-ink-500">{t.description}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="-m-1 inline-flex size-9 items-center justify-center rounded-full text-ink-400 hover:bg-subtle hover:text-ink-700" aria-label="Dismiss notification">
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
