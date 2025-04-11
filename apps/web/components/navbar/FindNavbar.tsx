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
import { useNotFoundContext } from "@/context/NotFoundContext";

export function FindNavbar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrollProgress, setScrollProgress] = useState(0);
  const { currency, changeCurrency } = useCurrency();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const selectedConversationId = useRecoilValue(selectedConversationState);
  const { conversationState } = useConversations();
  const { isNotFoundPage } = useNotFoundContext();

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
        extractedUsername = decodeURIComponent(pathSegments[1]);
        text = extractedUsername;
        break;
      case 'booking':
        extractedUsername = decodeURIComponent(pathSegments[1]);
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
      pathname.includes(`${ROUTES.NOTIFICATIONS}/`) || isNotFoundPage;
  }, [pathname, isNotFoundPage]);

  const shouldHideNavbar = useMemo(() => {
    return pathname.includes(ROUTES.BECOME_FREELANCER) ||
      pathname.includes(ROUTES.AUTH) ||
      pathname === ROUTES.HOME ||
      (pathname.includes(ROUTES.BOOK) && !isMobile) ||
      (selectedConversationId && isMobile) ||
      (pathname.includes(`${ROUTES.NOTIFICATIONS}/`) && isMobile);
  }, [pathname, isMobile, selectedConversationId]);

  const isSpecialPage = useMemo(() => {
    return ['specific-post', 'booking', 'messages', 'notifications', 'favorites', 'account-settings'].includes(pageType) || isNotFoundPage;
  }, [pageType, isNotFoundPage]);

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
      const progress = Math.min(Math.max(window.scrollY / 60, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (shouldHideNavbar) {
    return null;
  }

  const logoSize = 16 - (scrollProgress * 4);
  const fontSize = scrollProgress < 0.5 ? "text-3xl" : "text-2xl";
  const paddingTop = 6 - (scrollProgress * 4);
  const paddingBottom = 4 - (scrollProgress * 2);
  const shadowClass = scrollProgress > 0.3 ? `shadow-lg` : "shadow-sm";

  const bgClass = scrollProgress > 0.8
    ? "bg-gradient-to-t from-yellow-500 to-yellow-600"
    : "bg-white";

  if (isMobile) {
    return (
      <motion.div
        className={`sticky top-0 z-20
        ${scrollProgress && !isSpecialPage
            ? "border-b-2 bg-gradient-to-t from-yellow-500 to-yellow-600 border-b-yellow-500 shadow-md"
            : "border-b bg-white border-b-gray-300 shadow-sm"} rounded-b-3xl`}
        animate={{
          height: scrollProgress || isSpecialPage ? "72px" : "180px",
          paddingTop: scrollProgress || isSpecialPage ? "12px" : "24px",
          paddingBottom: scrollProgress ? "12px" : "36px"
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1.0]
        }}
      >
        <div className="px-4 flex flex-col h-full">
          <div className={`flex items-center ${isSpecialPage ? 'justify-start gap-20' : 'justify-between'}`}>
            <motion.div
              animate={{ scale: scrollProgress ? 0.9 : 1 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
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
                  {user ? (
                    <>
                      <AvatarImage
                        src={user.image || "https://github.com/shadcn.png"}
                        alt={user.name || "User Profile"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-neutral-700 text-neutral-300 group-hover:bg-amber-900/30 transition-all">
                        {user?.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-neutral-700 text-amber-400 group-hover:bg-amber-900/30 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 32 32"
                        style={{ display: "block", height: "100%", width: "100%", fill: "currentcolor" }}
                        aria-hidden="true"
                        role="presentation"
                        focusable="false"
                      >
                        <path d="M16 .7C7.56.7.7 7.56.7 16S7.56 31.3 16 31.3 31.3 24.44 31.3 16 24.44.7 16 .7zm0 28c-4.02 0-7.6-1.88-9.93-4.81a12.43 12.43 0 0 1 6.45-4.4A6.5 6.5 0 0 1 9.5 14a6.5 6.5 0 0 1 13 0 6.51 6.51 0 0 1-3.02 5.5 12.42 12.42 0 0 1 6.45 4.4A12.67 12.67 0 0 1 16 28.7z"></path>
                      </svg>
                    </AvatarFallback>
                  )}
                </Avatar>
              }
            </motion.div>

            {pageType === "default"
              ?
              <div className={`relative transition-all duration-300 h-12 w-12`}>
                <div className="absolute inset-0 z-10"></div>
                <Image
                  src={(scrollProgress > 0.2) ? LOGO["black-logo"] : LOGO["yellow-logo"]}
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
            animate={{
              opacity: scrollProgress ? 0 : 1,
              y: scrollProgress ? -10 : 0
            }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1.0]
            }}
          >
            <AnimatePresence>
              {!scrollProgress && !isSpecialPage && (
                <motion.div
                  className="w-full"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    transition: {
                      duration: 0.2,
                      ease: "easeOut"
                    }
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.1, 0.25, 1.0]
                  }}
                >
                  <SearchEngine>
                    <Button
                      variant="outline"
                      className="relative h-9 justify-start bg-gradient-to-t from-yellow-500 to-yellow-600 
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
      className={`sticky top-0 z-20 flex items-center justify-between border-b
      border-b-gray-200 px-24 transition-all duration-300 ease-in-out
      ${shadowClass} ${bgClass}`}
      style={{
        paddingTop: `${paddingTop * 0.25}rem`,
        paddingBottom: `${paddingBottom * 0.25}rem`
      }}
    >
      <div
        className="flex items-center gap-4 cursor-pointer group"
        onClick={() => router.push("/find")}
      >
        <div
          className="relative transition-all duration-300 rounded-[8px] bg-yellow-400"
          style={{
            height: `${logoSize * 0.25}rem`,
            width: `${logoSize * 0.25}rem`
          }}
        >
          <div className="absolute inset-0 z-10"></div>
          <Image
            src={LOGO["black-logo"]}
            alt="Instafix Logo"
            layout="fill"
            className="object-cover mix-blend-multiply scale-110"
          />
        </div>
        <h1 className={`transition-all duration-300 font-extrabold ${fontSize}`}>
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
            ${scrollProgress > 0.5
                  ? "skew-x-12 rotate-0 translate-y-0 ms-0"
                  : "skew-x-12 ms-1 group-hover:ms-0 -rotate-12 group-hover:rotate-0 translate-y-0 group-hover:translate-y-0"
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
        <div className="flex gap-9 justify-center items-center">
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
              <p
                className="text-xs font-medium transition-all duration-300 ease-in-out opacity-100"
                style={{
                  opacity: scrollProgress < 0.5 ? 1 - scrollProgress * 2 : 0,
                  height: scrollProgress < 0.5 ? '16px' : '0px',
                  overflow: 'hidden'
                }}
              >
                Location
              </p>
            </div>
          </LocationDialog>
          {user && (
            <NotificationBell scrollProgress={scrollProgress} />
          )}
          <CurrencyToggle currency={currency} changeCurrency={changeCurrency} />
          <ProfileDropdown user={user} pathname={pathname} />
        </div>
      </div>
    </div>
  );
}
