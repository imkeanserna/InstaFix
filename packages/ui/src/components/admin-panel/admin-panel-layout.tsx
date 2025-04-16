"use client";

import { cn } from "@repo/ui/lib/utils";
import { Sidebar } from "@repo/ui/components/admin-panel/sidebar";
import { useSidebarToggle } from "@repo/ui/hooks/use-sidebar-toggle";
import { Toaster } from "sonner";

export default function AdminPanelLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const sidebar = useSidebarToggle();
  return (
    <>
      <Sidebar />
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] bg-white dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          sidebar.isOpen === false ? "lg:ml-[70px]" : "lg:ml-[19rem]"
        )}
      >
        {children}
        <Toaster />
      </main>
    </>
  );
}
