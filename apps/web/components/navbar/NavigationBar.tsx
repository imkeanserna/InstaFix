"use client";

import { useConversations } from "@/hooks/chat/useConversations";
import { useNotificationHandler } from "@/hooks/notification/useNotifications";
import { useScrollVisibility } from "@/hooks/useScrollControls";
import { selectedConversationState } from "@repo/store";
import { Heart, House, Inbox, MessageCircle } from "lucide-react";
import { User } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { useRecoilValue } from "recoil";

export function NavigationBar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const selectedConversationId = useRecoilValue(selectedConversationState);
  const { visible } = useScrollVisibility(20, true);

  const { totalUnreadCount } = useConversations();
  const { unreadCount } = useNotificationHandler();

  const navItems = [
    { icon: House, label: 'Explore', path: '/find', showUnread: false },
    { icon: Heart, label: 'Favorites', path: '/favorites', showUnread: false },
    { icon: MessageCircle, label: 'Messages', path: '/messages', showUnread: true, count: totalUnreadCount },
    { icon: Inbox, label: 'Bookings', path: '/notifications', showUnread: true, count: unreadCount },
  ];

  const isSpecificNotificationPage = pathname !== '/notifications' && pathname.startsWith('/notifications/');
  const isSpecificFindPage = pathname !== '/find' &&
    pathname.startsWith('/find/') &&
    pathname !== '/find/camera' &&
    pathname !== '/find/search';

  if (isSpecificNotificationPage || isSpecificFindPage || selectedConversationId ||
    pathname.includes("/auth") || pathname.includes("/book") || pathname.includes("/become-a-freelancer")) {
    return null;
  }

  const isActive = (path: string) => pathname === path;
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div
      className={`fixed bottom-0 z-20 w-full flex items-center justify-between 
         transition-all duration-300 ease-in-out ${visible ? 'translate-y-0' : 'translate-y-full'}
         md:hidden`}
    >
      <div className="w-full h-full shadow-md py-3 bg-white flex items-center justify-center border-t border-gray-200">
        <div className="w-full flex items-center justify-evenly text-gray-500/80 font-medium">
          {user
            ?
            navItems.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col relative items-center cursor-pointer 
                  active:scale-[0.97] ${isActive(item.path) ? 'text-amber-500' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="w-6 h-6" />
                <p className="text-[10px]">{item.label}</p>
                {item.showUnread && item.count !== undefined && item.count > 0 && (
                  <div className="bg-red-500 rounded-full absolute -top-2 -right-2 text-white 
                      text-[10px] font-semibold w-5 h-5 flex justify-center items-center">
                    {item.count}
                  </div>
                )}
              </div>
            ))
            :
            <div
              className={`flex flex-col relative items-center cursor-pointer 
                  active:scale-[0.97] ${isActive(navItems[0].path) ? 'text-amber-500' : ''}`}
              onClick={() => handleNavigation(navItems[0].path)}
            >
              <House className="w-6 h-6" />
              <p className="text-[10px]">{navItems[0].label}</p>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
