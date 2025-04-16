import Link from "next/link";
import { PanelsTopLeft } from "lucide-react";

import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/ui/button";
import { Menu } from "@repo/ui/components/admin-panel/menu";
import { useSidebarToggle } from "@repo/ui/hooks/use-sidebar-toggle";
import { SidebarToggle } from "@repo/ui/components/admin-panel/sidebar-toggle";
import Image from "next/image";

export const LOGO = {
  "black-logo": "/nav-bar/instafix-logo-black.svg",
  "yellow-logo": "/nav-bar/instafix-logo-yellow.svg"
}

export function Sidebar() {
  const sidebar = useSidebarToggle();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 min-h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar.isOpen === false ? "w-[70px]" : "w-[19rem]"
      )}
    >
      <SidebarToggle isOpen={sidebar.isOpen} setIsOpen={sidebar.setIsOpen} />
      <div className="relative h-full flex flex-col px-0 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800 mt-4">
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            sidebar.isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/dashboard" className={`flex items-center gap-1`}>
            <div className={`relative  transition-all duration-300 h-8 w-8 rounded-[8px] bg-yellow-400`}>
              <div className="absolute inset-0 z-10"></div>
              <Image
                src={LOGO["black-logo"]}
                alt="Instafix Logo"
                layout="fill"
                className="object-cover mix-blend-multiply scale-100 rounded-[8px]"
              />
            </div>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                sidebar.isOpen === false ? "w-0 opacity-0" : "w-auto opacity-100 p-2"
              )}
            >
              <h1 className="font-extrabold text-2xl md:text-2xl">
                <span className="text-gray-900 inline-block transform -skew-x-12">
                  insta
                  <span
                    className={`
                    bg-yellow-400 px-1 rounded-lg text-gray-900 relative 
                    inline-block transform transition-all duration-500
                    skew-x-12 ms-1 group-hover:ms-0 -rotate-12 group-hover:rotate-0 
                    translate-y-0 group-hover:translate-y-0
                  `}
                  >
                    {/* Nail dot in the top right */}
                    <span className="absolute -top-1 -right-1 h-[6px] w-[6px] bg-gray-500 rounded-full shadow-sm"></span>
                    fix
                  </span>
                </span>
              </h1>
            </div>
          </Link>
        </Button>
        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}
