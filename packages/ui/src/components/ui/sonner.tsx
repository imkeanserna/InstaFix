"use client";

import { useTheme } from '@repo/ui/context/ThemeContext';
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export { toast } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      offset="24px"
      expand={false}
      toastOptions={{
        classNames: {
          toast: [
            "group toast",
            "group-[.toaster]:bg-white",
            "group-[.toaster]:text-slate-900",
            "group-[.toaster]:border-0",
            "group-[.toaster]:shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
            "group-[.toaster]:rounded-xl",
            "group-[.toaster]:p-4",
            "group-[.toaster]:flex",
            "group-[.toaster]:gap-3",
            "group-[.toaster]:items-start",
            "dark:group-[.toaster]:bg-slate-900",
            "dark:group-[.toaster]:text-slate-100",
            "group-[.toaster]:min-w-[320px]",
            "group-[.toaster]:backdrop-blur-sm",
            // Animation classes
            "data-[swipe=move]:transition-none",
            "group-[.toaster]:slide-in-from-right-1/2",
            "group-[.toaster]:duration-200",
            "[&:has(>div)]:animate-in",
            "[&:has(>div)]:slide-in-from-right",
          ].join(" "),
          title: [
            "group-[.toast]:text-sm",
            "group-[.toast]:font-medium",
            "group-[.toast]:leading-tight",
            "group-[.toast]:tracking-tight",
          ].join(" "),
          description: [
            "group-[.toast]:text-sm",
            "group-[.toast]:text-slate-600",
            "dark:group-[.toast]:text-slate-400",
            "group-[.toast]:leading-relaxed",
          ].join(" "),
          actionButton: [
            "group-[.toast]:bg-slate-900",
            "group-[.toast]:text-white",
            "dark:group-[.toast]:bg-white",
            "dark:group-[.toast]:text-slate-900",
            "group-[.toast]:rounded-lg",
            "group-[.toast]:px-3",
            "group-[.toast]:py-1.5",
            "group-[.toast]:text-xs",
            "group-[.toast]:font-medium",
            "group-[.toast]:transition-colors",
            "group-[.toast]:hover:opacity-90",
          ].join(" "),
          cancelButton: [
            "group-[.toast]:bg-transparent",
            "group-[.toast]:text-slate-600",
            "dark:group-[.toast]:text-slate-400",
            "group-[.toast]:rounded-lg",
            "group-[.toast]:px-3",
            "group-[.toast]:py-1.5",
            "group-[.toast]:text-xs",
            "group-[.toast]:font-medium",
            "group-[.toast]:hover:bg-slate-100",
            "dark:group-[.toast]:hover:bg-slate-800",
          ].join(" "),
          success: [
            "group-[.toast]:bg-emerald-50",
            "dark:group-[.toast]:bg-emerald-900/30",
            "group-[.toast]:border-l-4",
            "group-[.toast]:border-l-emerald-500",
          ].join(" "),
          error: [
            "group-[.toast]:bg-red-50",
            "dark:group-[.toast]:bg-red-900/30",
            "group-[.toast]:border-l-4",
            "group-[.toast]:border-l-red-500",
          ].join(" "),
          warning: [
            "group-[.toast]:bg-amber-50",
            "dark:group-[.toast]:bg-amber-900/30",
            "group-[.toast]:border-l-4",
            "group-[.toast]:border-l-amber-500",
          ].join(" "),
          info: [
            "group-[.toast]:bg-blue-50",
            "dark:group-[.toast]:bg-blue-900/30",
            "group-[.toast]:border-l-4",
            "group-[.toast]:border-l-blue-500",
          ].join(" "),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
