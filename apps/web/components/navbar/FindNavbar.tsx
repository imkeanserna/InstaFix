"use client";

import { Button } from "@repo/ui/components/ui/button";
import { LocationDialog } from "../posts/find/location";
import { SearchEngine } from "../posts/find/search-engine";
import { CurrencyToggle, NotificationBell } from "../posts/notification/notification";
import ProfileDropdown from "../user/ProfileDropdown";
import { User } from "next-auth";
import { Earth, MoveLeft, Search, UsersIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Location } from "../ui/locationNavigation";
import { useCurrency } from "@/hooks/useCurrency";
import { useMediaQuery } from "@/hooks/useMedia";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { selectedConversationState } from "@repo/store";
import { useRecoilValue } from "recoil";
import { useConversations } from "@/hooks/chat/useConversations";
import { NotificationIcon } from "../posts/notificationBell";
import Image from "next/image";
import { LOGO } from "@/lib/landingPageUtils";

export function FindNavbar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const { currency, changeCurrency } = useCurrency();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const selectedConversationId = useRecoilValue(selectedConversationState);
  const { conversationState } = useConversations();

  const ROUTES = {
    MESSAGES: '/messages',
    NOTIFICATIONS: '/notifications',
    FAVORITES: '/favorites',
    ACCOUNT_SETTINGS: '/account-settings',
    FIND: '/find/',
    BOOK: '/book/',
    AUTH: '/auth',
    BECOME_FREELANCER: '/become-a-freelancer',
    HOME: '/'
  };

  const pageType = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathname.startsWith(ROUTES.FIND) && pathSegments.length > 2) return 'specific-post';
    if (pathname.startsWith(ROUTES.BOOK) && pathSegments.length > 1) return 'booking';
    if (pathname.startsWith(ROUTES.MESSAGES)) return 'messages';
    if (pathname.startsWith(ROUTES.NOTIFICATIONS)) return 'notifications';
    if (pathname.startsWith(ROUTES.FAVORITES)) return 'favorites';
    if (pathname.startsWith(ROUTES.ACCOUNT_SETTINGS)) return 'account-settings';
    return 'default';
  }, [pathname]);

  const { username, displayText } = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    let extractedUsername = null;
    let text = "Instafix";

    switch (pageType) {
      case 'specific-post':
        extractedUsername = pathSegments[1];
        text = extractedUsername;
        break;
      case 'booking':
        extractedUsername = pathSegments[1];
        text = `Book with ${extractedUsername}`;
        break;
      case 'messages':
        text = "Messages";
        break;
      case 'notifications':
        text = "Notifications";
        break;
      case 'favorites':
        text = "Recently Favorites";
        break;
      case 'account-settings':
        text = "Account Settings";
        break;
    }

    return { username: extractedUsername, displayText: text };
  }, [pageType, pathname]);

  const shouldHideSearch = useMemo(() => {
    return [ROUTES.MESSAGES, ROUTES.NOTIFICATIONS, ROUTES.FAVORITES].includes(pathname) ||
      pathname.includes(`${ROUTES.NOTIFICATIONS}/`);
  }, [pathname]);

  const shouldHideNavbar = useMemo(() => {
    return pathname.includes(ROUTES.BECOME_FREELANCER) ||
      pathname.includes(ROUTES.AUTH) ||
      pathname === ROUTES.HOME ||
      (pathname.includes(ROUTES.BOOK) && !isMobile) ||
      (selectedConversationId && isMobile) ||
      (pathname.includes(`${ROUTES.NOTIFICATIONS}/`) && isMobile);
  }, [pathname, isMobile, selectedConversationId]);

  const isSpecialPage = useMemo(() => {
    return ['specific-post', 'booking', 'messages', 'notifications', 'favorites', 'account-settings'].includes(pageType);
  }, [pageType]);

  const updateUrlParams = useCallback((updates: Partial<{
    location: Location | null;
  }>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        params.delete(key)
      } else if (typeof value === 'object') {
        params.set(key, JSON.stringify(value))
      } else {
        params.set(key, String(value))
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (shouldHideNavbar) {
    return null;
  }

  if (isMobile) {
    return (
      <motion.div
        className={`sticky top-0 z-20
        ${scrolled && !isSpecialPage
            ? "bg-gradient-to-r border-b-2 from-amber-400 to-yellow-500 border-b-yellow-500 shadow-md"
            : "border-b bg-white border-b-gray-300 shadow-sm"} rounded-b-3xl`}
        animate={{
          height: scrolled || isSpecialPage ? "72px" : "180px",
          paddingTop: scrolled || isSpecialPage ? "12px" : "24px",
          paddingBottom: scrolled ? "12px" : "36px"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="px-4 flex flex-col h-full">
          <div className={`flex items-center ${isSpecialPage ? 'justify-start gap-20' : 'justify-between'}`}>
            <motion.div
              animate={{ scale: scrolled ? 0.9 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {isSpecialPage
                ?
                <Button
                  variant="outline"
                  className="active:scale-[0.97] gap-0 w-12 h-12 rounded-full border-none bg-gray-100"
                  onClick={() => router.back()}
                >
                  <MoveLeft className="h-6 w-6 scale-150 text-gray-700" />
                </Button>
                :
                <Avatar
                  onClick={() => router.push(user ? "/account-settings" : "/auth/login")}
                  className="h-12 w-12 border-transparent border-2 border-amber-500 transition-all cursor-pointer active:scale-[0.97]"
                >
                  <AvatarImage
                    src={user?.image || "https://github.com/shadcn.png"}
                    alt={user?.name || "User Profile"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-neutral-700 text-neutral-300 group-hover:bg-amber-900/30 transition-all">
                    {user?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              }
            </motion.div>

            {pageType === "default"
              ?
              <div className={`relative transition-all duration-300 h-12 w-12`}>
                <div className="absolute inset-0 z-10"></div>
                <Image
                  src={scrolled ? LOGO["black-logo"] : LOGO["yellow-logo"]}
                  alt="Instafix Logo"
                  layout="fill"
                  className="object-cover mix-blend-multiply scale-110"
                />
              </div>
              :
              <p className="text-lg truncate w-[200px] text-center">{displayText}</p>
            }

            {pageType === 'messages' && conversationState.conversations.length > 0 && (
              <div className="text-yellow-600 flex justify-center items-center gap-1 rounded-xl bg-yellow-50 p-1">
                <UsersIcon className="w-4 h-4" />
                <p className="font-bold">{conversationState.conversations.length}</p>
              </div>
            )}

            {pageType === 'notifications' && (
              <NotificationIcon isClickable={false} />
            )}

            {!isSpecialPage && (
              <LocationDialog onFilterChange={updateUrlParams}>
                <Button
                  variant="outline"
                  className="active:scale-[0.97] gap-0 w-12 h-12 rounded-full border-none 
                bg-gradient-to-r from-amber-400/70 to-yellow-500/80 hover:bg-yellow-500/30 hover:border-gray-900 hover:text-gray-900 relative"
                >
                  <div className="flex flex-col items-center">
                    <Earth className="h-6 w-6 text-gray-600" />
                  </div>
                </Button>
              </LocationDialog>
            )}
          </div>

          {/* Bottom row (search bar) */}
          <motion.div
            className="flex-grow flex items-center mt-4"
            animate={{ opacity: scrolled ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence>
              {!scrolled && !isSpecialPage && (
                <motion.div
                  className="w-full"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <SearchEngine>
                    <Button
                      variant="outline"
                      className="relative h-9 justify-start bg-gradient-to-r from-amber-400/70 to-yellow-500/80 
                        text-gray-600 text-sm group border-none w-full py-9 pe-6 ps-6 rounded-full"
                    >
                      <div className="me-4">
                        <Search className="w-6 h-6" />
                      </div>
                      <span className="inline-flex">Search for freelancers</span>
                    </Button>
                  </SearchEngine>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={`sticky top-0 z-20 bg-white flex items-center justify-between 
      border-b-gray-200 px-24 transition-all duration-300 ease-in-out
      ${scrolled ? "shadow-lg py-2" : "shadow-sm pt-6 pb-4"}`}
    >
      <div className="flex items-center gap-4">
        <div className={`relative transition-all duration-300 ${scrolled ? "h-12 w-12" : "h-16 w-16"} rounded-[8px] bg-yellow-400`}>
          <div className="absolute inset-0 z-10"></div>
          <Image
            src={LOGO["black-logo"]}
            alt="Instafix Logo"
            layout="fill"
            className="object-cover mix-blend-multiply scale-110"
          />
        </div>
        <h1 className={`transition-all duration-300 font-extrabold ${scrolled ? "text-2xl" : "text-3xl"}`}>
          <span className="text-gray-900 inline-block transform -skew-x-12">
            insta
            <span
              className={`
              bg-yellow-400 
              px-1 
              rounded-lg
              text-gray-900 
              relative 
              inline-block
              transform
              transition-all
              duration-500
            ${scrolled
                  ? "skew-x-12 rotate-0 translate-y-0 ms-0"
                  : "skew-x-12 ms-1 hover:ms-0 -rotate-12 hover:rotate-0 translate-y-0 hover:translate-y-0"
                }
            `}
            >
              {/* Nail dot in the top right */}
              <span className="absolute -top-1 -right-1 h-[6px] w-[6px] bg-gray-500 rounded-full shadow-sm"></span>
              fix
            </span>
          </span>
        </h1>
      </div>
      <div className="flex gap-44 justify-center items-center">
        {!shouldHideSearch &&
          <SearchEngine>
            <Button
              variant="outline"
              className="relative h-9 justify-start text-sm group text-muted-foreground w-[28rem] py-7 pe-6 ps-2 rounded-full shadow-sm"
            >
              <div className="p-3 rounded-full bg-yellow-400 me-4 group-hover:bg-yellow-500">
                <Search className="w-4 h-4 text-gray-900" />
              </div>
              <span className="hidden lg:inline-flex">Search...</span>
              <span className="inline-flex lg:hidden">Search...</span>
              <kbd className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </SearchEngine>
        }
        <div className={`flex gap-9 ${scrolled ? "justify-center items-center" : "justify-center items-center"}`}>
          <LocationDialog
            onFilterChange={updateUrlParams}
          >
            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                className="active:scale-[0.97] gap-0 py-6 px-3 rounded-full border-none hover:bg-yellow-400 hover:border-gray-900 hover:text-gray-900 relative"
              >
                <div className="space-y-1 flex flex-col items-center">
                  <Earth className="h-6 w-6 text-gray-700" />
                </div>
              </Button>
              {!scrolled && <p className="text-xs font-medium transition-opacity duration-300 ease-in-out opacity-100">Location</p>}
            </div>
          </LocationDialog>
          {user && (
            <NotificationBell isScrolled={scrolled} />
          )}
          <CurrencyToggle currency={currency} changeCurrency={changeCurrency} />
          <ProfileDropdown user={user} pathname={pathname} />
        </div>
      </div>
    </div>
  );
}
