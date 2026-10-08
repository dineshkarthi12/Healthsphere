import { forwardRef } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold select-none transition-[background-color,color,box-shadow,transform,border-color] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white shadow-[0_6px_16px_-6px_rgb(26_99_220/0.55)] hover:bg-primary-700",
        accent: "bg-accent-ink text-white shadow-[0_6px_16px_-8px_var(--accent)] hover:brightness-110",
        secondary: "bg-primary-50 text-primary-700 hover:bg-primary-100",
        outline: "border border-line-strong bg-white text-ink-800 hover:border-primary-300 hover:bg-primary-25 hover:text-primary-700",
        ghost: "text-ink-700 hover:bg-subtle hover:text-ink-900",
        danger: "bg-danger-600 text-white shadow-[0_6px_16px_-6px_rgb(201_47_60/0.5)] hover:bg-danger-700",
        "danger-soft": "bg-danger-50 text-danger-700 hover:bg-danger-100",
        success: "bg-success-700 text-white hover:bg-success-500",
        white: "bg-white text-primary-700 shadow-card hover:bg-primary-25",
        link: "h-auto px-0 text-primary-700 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 rounded-md px-3 text-small",
        md: "h-11 rounded-md px-4 text-[0.9375rem]",
        lg: "h-13 rounded-lg px-6 text-body",
        icon: "size-11 rounded-md",
        "icon-sm": "size-9 rounded-md",
      },
      block: { true: "w-full" },
    },
    compoundVariants: [{ variant: "link", class: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, Variants {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, loading, disabled, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export interface ButtonLinkProps extends LinkProps, Variants {}

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(({ className, variant, size, block, ...props }, ref) => (
  <Link ref={ref} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />
));
ButtonLink.displayName = "ButtonLink";
