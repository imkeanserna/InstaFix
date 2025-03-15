"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import { Button } from "@repo/ui/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import { User as UserIcon, Settings, LogOut, ChevronRight, MessageCircle, Heart, BriefcaseBusiness } from 'lucide-react'
import { useTheme } from '@repo/ui/context/ThemeContext';
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import { useConversations } from "@/hooks/chat/useConversations"
import { useRouter } from "next/navigation"

interface ProfileDropdownProps {
  user?: User | null;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user = null }) => {
  const { theme, toggleTheme } = useTheme();
  const darkTheme = theme === 'dark';
  const { totalUnreadCount } = useConversations();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative bg-yellow-400 hover:bg-yellow-500 flex group items-center justify-center gap-2 border border-gray-500 rounded-full py-7 px-4
          transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-md"
        >
          <p className="font-medium">{user?.name}</p>
          <div className="relative">
            <Avatar className={`h-12 w-12 border-transparent ${totalUnreadCount > 0 ? 'border-2' : 'border'} border-amber-500 transition-all`}>
              <AvatarImage
                src={user?.image || "https://github.com/shadcn.png"}
                alt={user?.name || "User Profile"}
                className="object-cover"
              />
              <AvatarFallback className="bg-neutral-700 text-neutral-300 group-hover:bg-amber-900/30 transition-all">
                {user?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {totalUnreadCount > 0 && (
              <div className="px-2 py-1 rounded-full bg-red-500 text-white absolute -top-1 -right-1 flex items-center justify-center border border-white">
                <p className="text-xs">{totalUnreadCount}</p>
              </div>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 border-2 border-gray-200 rounded-2xl shadow-2xl overflow-hidden p-0"
        align="end"
        forceMount
      >
        {/* User Profile Header */}
        <div className="px-4 py-4 border-b border-gray-200"
        >
          <div className="flex items-center space-x-3 text-gray-900">
            <Avatar className="h-12 w-12 border-2 border-amber-500">
              <AvatarImage
                src={user?.image || "https://github.com/shadcn.png"}
                alt={user?.name || "User Profile"}
                className="object-cover"
              />
              <AvatarFallback className="bg-neutral-700 text-neutral-300 group-hover:bg-amber-900/30">
                {user?.name!.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold transition-colors">
                {user?.name}
              </p>
              <p className="text-xs truncate transition-colors">
                {user?.email}
              </p>
            </div>
            <ChevronRight className="text-neutral-500 w-5 h-5 group-hover:text-amber-500 transition-colors" />
          </div>
        </div>

        {/* Menu Items */}
        <div>
          <DropdownMenuGroup className="space-y-1">
            {[
              {
                icon: <MessageCircle className="menu-icon" />,
                text: 'Messages',
                hoverClass: 'hover:text-amber-500',
                badge: totalUnreadCount > 0 ? totalUnreadCount.toString() : null,
                url: '/messages'
              },
              {
                icon: <Heart className="menu-icon" />,
                text: 'Favorites',
                hoverClass: 'hover:text-amber-500',
                badge: 10,
                url: null
              },
              {
                icon: <UserIcon className="menu-icon" />,
                text: 'Profile',
                hoverClass: 'hover:text-amber-500',
                url: null
              },
              {
                icon: <Settings className="menu-icon" />,
                text: 'Settings',
                hoverClass: 'hover:text-amber-500',
                badge: 'Coming soon',
                badgeClass: 'text-xs text-gray-500',
                url: null
              },
              {
                icon: <BriefcaseBusiness className="menu-icon" />,
                text: 'Be a freelancer',
                hoverClass: 'hover:text-amber-500',
                url: '/become-a-freelancer'
              },
            ].map(({ icon, text, hoverClass, badge, url }) => (
              <DropdownMenuItem
                key={text}
                className={`cursor-pointer py-3 px-4 transition-all group relative flex text-gray-900 items-center
                  hover:bg-amber-900/10 ${hoverClass}`}
                onClick={() => {
                  if (url) {
                    router.push(url);
                  }
                }}
              >
                {React.cloneElement(icon, {
                  className: `mr-3 h-5 w-5 transition-colors`
                })}
                <span className="transition-colors flex-grow">
                  {text}
                </span>
                {badge && (
                  <span className="absolute right-4 text-xs text-amber-700">
                    {badge}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          {/* Logout Section */}
          <div className="border-t">
            <DropdownMenuItem
              className="cursor-pointer px-4 py-2.5 transition-all group flex items-center"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
            >
              <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600" />
              <span className="group-hover:text-red-600 text-red-500">Log out</span>
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
