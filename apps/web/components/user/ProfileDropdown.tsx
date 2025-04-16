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
import {
  User as UserIcon,
  Settings,
  LogOut,
  ChevronRight,
  MessageCircle,
  Heart,
  BriefcaseBusiness,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { useTheme } from '@repo/ui/context/ThemeContext';
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import { useConversations } from "@/hooks/chat/useConversations"
import { useRouter } from "next/navigation"
import { useAuthModal } from "@repo/ui/context/AuthModalProvider"
import { useMediaQuery } from "@/hooks/useMedia"
import { useFavorites } from "@/hooks/favorites/useFavorites"

interface ProfileDropdownProps {
  user?: User | null;
  pathname: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user = null, pathname }) => {
  const { theme, toggleTheme } = useTheme();
  const darkTheme = theme === 'dark';
  const { totalUnreadCount } = useConversations();
  const router = useRouter();
  const { openModal } = useAuthModal();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { totalFavorites } = useFavorites();

  const handleAuth = () => {
    if (!user) {
      if (isMobile) {
        router.push("/auth/login");
        return;
      }
      openModal();
    } else {
      signOut();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {user
          ? (
            <Button
              variant="ghost"
              className="relative bg-yellow-400 hover:bg-yellow-500 flex group items-center justify-center gap-2 border border-gray-500 rounded-full py-7 px-5
          transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-md"
            >
              <div>
                <p className="font-medium">{user?.name}</p>
                {user?.isFreelancer &&
                  <div className="flex items-center justify-start gap-1 text-xs font-semibold text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="w-5 h-5"
                    >
                      <circle
                        cx="8.00004"
                        cy="7.99998"
                        r="6.66667"
                        fill="url(#paint0_linear_3_20)"
                      />
                      <circle
                        cx="7.99996"
                        cy="8.00002"
                        r="5.33333"
                        fill="url(#paint1_linear_3_20)"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.66671 5.33331H5.33337V6.66665H6V6.66667V10V11.3333H7.33333V10V6.66667V5.33333H6.66671V5.33331ZM8.66667 10H8V11.3333H8.66667C10.1394 11.3333 11.3333 10.1394 11.3333 8.66667V8C11.3333 6.52724 10.1394 5.33333 8.66667 5.33333H8V6.66667H8.66667C9.40305 6.66667 10 7.26362 10 8V8.66667C10 9.40305 9.40305 10 8.66667 10Z"
                        fill="white"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear_3_20"
                          x1="8.00004"
                          y1="1.33331"
                          x2="8.00004"
                          y2="14.6666"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#4B5563" />
                          <stop offset="1" stopColor="#374151" />
                        </linearGradient>
                        <linearGradient
                          id="paint1_linear_3_20"
                          x1="7.99996"
                          y1="2.66669"
                          x2="7.99996"
                          y2="13.3334"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#374151" />
                          <stop offset="1" stopColor="#4B5563" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {user?.credits && user?.credits > 0
                      ?
                      <p>{user?.credits} {user?.credits > 1 ? "Credits" : "Credit"}</p>
                      :
                      <p>No Credits</p>
                    }
                  </div>
                }
              </div>

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
          )
          : (
            <Button
              variant="ghost"
              className="relative bg-yellow-400 hover:bg-yellow-500 flex group items-center justify-center gap-3 border border-gray-500 rounded-xl py-6 px-5
              transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-md hover:text-gray-900"
            >
              <p className="font-bold text-base transition-all">Get Started</p>
              <div className="relative transition-transform duration-300 transform group-hover:translate-x-1">
                <LogIn className="h-6 w-6" />
              </div>
            </Button>
          )
        }
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-72 border-2 border-gray-200 rounded-2xl shadow-2xl overflow-hidden p-0"
        align="end"
        forceMount
      >
        {user ? (
          <>
            {/* User Profile Header */}
            < div className="px-4 py-4 border-b border-gray-200"
            >
              <div className="flex items-center space-x-3 text-gray-900">
                <div className="flex items-start space-x-3">
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
                    {user?.isFreelancer && (
                      <div className="flex items-center mt-1">
                        {user?.accountType === "FREE" && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg font-medium flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                            Free Plan
                          </span>
                        )}
                        {user?.accountType === "PRO" && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1"></span>
                            Pro Plan
                          </span>
                        )}
                        {user?.accountType === "PREMIUM" && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1"></span>
                            Premium Plan
                          </span>
                        )}
                      </div>
                    )}
                  </div>
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
                    badgeClass: 'text-[12px] text-gray-500',
                    url: '/messages'
                  },
                  {
                    icon: <Heart className="menu-icon" />,
                    text: 'Favorites',
                    hoverClass: 'hover:text-amber-500',
                    badge: totalFavorites > 0 ? totalFavorites.toString() : null,
                    badgeClass: 'text-[12px] text-gray-500',
                    url: '/favorites'
                  },
                  {
                    icon: <UserIcon className="menu-icon" />,
                    text: 'Profile',
                    hoverClass: 'hover:text-amber-500',
                    badge: 'Coming soon',
                    badgeClass: 'text-[10px] text-gray-500',
                    url: null
                  },
                  {
                    icon: <Settings className="menu-icon" />,
                    text: 'Settings',
                    hoverClass: 'hover:text-amber-500',
                    badge: 'Coming soon',
                    badgeClass: 'text-[10px] text-gray-500',
                    url: null
                  },
                  {
                    icon: <BriefcaseBusiness className="menu-icon" />,
                    text: (user?.isFreelancer ? 'Switch to dashboard' : 'Become a Freelancer'),
                    hoverClass: 'hover:text-amber-500',
                    url: (user?.isFreelancer ? '/dashboard' : '/become-a-freelancer')
                  },
                ].map(({ icon, text, hoverClass, badge, url, badgeClass }) => (
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
                      <span className={`absolute right-4 text-amber-700 ${badgeClass}}`}>
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
                  onClick={() => signOut({ callbackUrl: pathname })}
                >
                  <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600" />
                  <span className="group-hover:text-red-600 text-red-500">Log out</span>
                </DropdownMenuItem>
              </div>
            </div>
          </>
        )
          : (
            <div className="p-4 space-y-4">
              <div className="text-center pb-2 border-b border-gray-200">
                <h3 className="font-semibold text-lg mb-1">Welcome!</h3>
                <p className="text-sm text-gray-600 mb-2">Sign in to access all features</p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleAuth}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium 
                    py-6 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <LogIn className="h-4 w-4" />
                  Log In
                </Button>
                <Button
                  onClick={handleAuth}
                  variant="outline"
                  className="w-full border-2 border-yellow-400 text-gray-800 font-medium 
                    py-6 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </div>
              <div className="text-center pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">Join our community today</p>
              </div>
            </div>
          )}
      </DropdownMenuContent>
    </DropdownMenu >
  );
};

export default ProfileDropdown;
