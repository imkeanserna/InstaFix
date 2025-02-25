"use client";

import { useNotificationCard, useNotifications } from "@/hooks/notification/useNotifications";
import { MessageType, NotificationType, TypeBookingNotification } from "@repo/types";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { BookingActionData, useBookingMessage } from "@/hooks/useBooking";
import { BookingEventType, BookingStatus } from "@prisma/client/edge";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { capitalizeFirstLetter } from "@/lib/notificationUtils";
import { DotTypingLoading } from "@repo/ui/components/ui/dot-typing-loading";
import { useRouter } from "next/navigation";
import { NotificationIcon } from "../notificationBell";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";

export function Notifications() {
  const router = useRouter();
  const { notificationState, addNotification, error, isLoading } = useNotifications();
  const { sendMessage, lastMessage, clearMessage } = useWebSocket();
  const { data: session, status } = useSession();

  useBookingMessage({
    lastMessage,
    onBookingCreated: () => {
      if (lastMessage?.type === MessageType.NOTIFICATION && lastMessage?.action === NotificationType.BOOKING) {
        addNotification(lastMessage?.payload as TypeBookingNotification);
      }
      clearMessage();
    },
    onError: (error) => {
      clearMessage();
    }
  });

  if (isLoading || error || status === 'loading') {
    return <NotificationsSkeleton />;
  }

  if (!session?.user || !session?.user?.id) {
    router.back();
    return null;
  }

  return (
    <div className="space-y-8 py-8">
      <div className="flex justify-between items-center px-4 md:px-0">
        <div className="flex gap-4 items-center">
          <Button
            variant="outline"
            className="rounded-full active:scale-95 px-4 py-6 border-none group"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
          </Button>
          <h1 className="text-3xl font-semibold">Notifications</h1>
        </div>
        <NotificationIcon
          unreadCount={notificationState.pagination.unreadCount}
        />
      </div>
      {notificationState.notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-2 md:space-y-6">
          {notificationState.notifications.map((notification: TypeBookingNotification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              user={session?.user as User}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface StatusMessageProps {
  status: BookingStatus
  isFreelancer: boolean
  isClient: boolean
  clientName: string
  freelancerName: string
  checkoutDate: string
  postTitle: string
}

export const getStatusMessage = ({
  status,
  isFreelancer,
  isClient,
  clientName,
  freelancerName,
  checkoutDate,
  postTitle
}: StatusMessageProps) => {
  const client = capitalizeFirstLetter(clientName);
  const freelancer = capitalizeFirstLetter(freelancerName);

  const messages = {
    PENDING: {
      freelancer: (
        <>
          <span className="font-bold">{client}</span>
          <span className="text-gray-700">{" "}requested a booking in{" "}</span>
          <span className="font-bold">{postTitle}</span>
          <span className="text-gray-700">{" "}on{" "}</span>
          <span className="font-bold">{checkoutDate}</span>
        </>
      ),
      client: (
        <>
          <span className="text-gray-700">Waiting for{" "}</span>
          <span className="font-bold">{freelancer}</span>
          <span className="text-gray-700">{" "}to respond to your booking request for{" "}</span>
          <span className="font-bold">{postTitle}</span>
          <span className="text-gray-700">{" "}on{" "}</span>
          <span className="font-bold">{checkoutDate}</span>
        </>
      )
    },
    CONFIRMED: {
      freelancer: (
        <>
          <span className="text-gray-700">{`You've accepted the booking with`}</span>
          <span className="font-bold">{" "}{client}</span>
          <span className="text-gray-700">{" "}for{" "}</span>
          <span className="font-bold">{postTitle}</span>
          <span className="text-gray-700">{" "}on{" "}</span>
          <span className="font-bold">{checkoutDate}</span>
        </>
      ),
      client: (
        <>
          <span className="font-bold">{freelancer}</span>
          <span className="text-gray-700">{" "}has accepted your booking request for{" "}</span>
          <span className="font-bold">{postTitle}</span>
          <span className="text-gray-700">{" "}on{" "}</span>
          <span className="font-bold">{checkoutDate}</span>
        </>
      )
    },
    COMPLETED: {
      freelancer: (
        <>
          <span className="text-gray-700">Your booking with{" "}</span>
          <span className="font-bold">{client}</span>
          <span className="text-gray-700">{" "}for{" "}</span>
          <span className="font-bold">{postTitle}</span>
          <span className="text-gray-700">{" "}has been successfully completed.</span>
        </>
      ),
      client: (
        <>
          <span className="text-gray-700">Your booking with{" "}</span>
          <span className="font-bold">{freelancer}</span>
          <span className="text-gray-700">{" "}for{" "}</span>
          <span className="font-bold">{postTitle}</span>
          <span className="text-gray-700">{" "}is now completed.</span>
        </>
      )
    },
    CANCELLED: {
      freelancer: (
        <>
          <span className="text-gray-700">Your booking with{" "}</span>
          <span className="font-bold">{client}</span>
          <span className="text-gray-700">{" "}for{" "}</span>
          <span className="font-bold">{postTitle}</span>
          <span className="text-gray-700">{" "}has been cancelled.</span>
        </>
      ),
      client: (
        <>
          <span className="text-gray-700">Your booking with{" "}</span>
          <span className="font-bold">{freelancer}</span>
          <span className="text-gray-700">{" "}for{" "}</span>
          <span className="font-bold">{postTitle}</span>
          <span className="text-gray-700">{" "}has been cancelled.</span>
        </>
      )
    },
    DECLINED: {
      freelancer: (
        <>
          <span className="text-gray-700">{`You've declined the booking request from`}{" "}</span>
          <span className="font-bold">{client}</span>
          <span className="text-gray-700">{" "}for{" "}</span>
          <span className="font-bold">{postTitle}</span>
          <span className="text-gray-700">{" "}on{" "}</span>
          <span className="font-bold">{checkoutDate}</span>
        </>
      ),
      client: (
        <>
          <span className="font-bold">{freelancer}</span>
          <span className="text-gray-700">{" "}has declined your booking request for{" "}</span>
          <span className="font-bold">{postTitle}</span>
          <span className="text-gray-700">{" "}on{" "}</span>
          <span className="font-bold">{checkoutDate}</span>
        </>
      )
    }
  };

  if (isFreelancer) {
    return messages[status as BookingStatus].freelancer;
  } else if (isClient) {
    return messages[status as BookingStatus].client;
  }
  return null;
};

export const getStatusBadge = (status: BookingStatus) => {
  const styles: Record<Exclude<keyof typeof BookingStatus, "PENDING">, string> = {
    CONFIRMED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    DECLINED: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${styles[status as Exclude<keyof typeof BookingStatus, "PENDING">]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

interface NotificationCardProps {
  notification: TypeBookingNotification;
  user: User
}

export function NotificationCard({
  notification,
  user
}: NotificationCardProps) {
  const {
    bookingStatus,
    formattedDate,
    isFreelancer,
    isActionLoading,
    handleAction,
    isClient,
    exactTime,
    timeAgo
  } = useNotificationCard(notification, user);
  const router = useRouter();

  const statusMessage = getStatusMessage({
    status: bookingStatus,
    isFreelancer,
    isClient,
    clientName: notification.booking.client.name || '',
    freelancerName: notification.booking.freelancer.name || '',
    checkoutDate: formattedDate,
    postTitle: notification.booking.post.title || ''
  });

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target instanceof Element &&
      (e.target.closest('button') || e.target.closest('[data-action-button]'))) {
      return;
    }
    router.push(`/notifications/${notification.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`p-4 md:p-8 hover:bg-gray-50 shadow-lg rounded-xl transition-colors cursor-pointer 
        ${!notification.isRead ? `border-l-[10px] border-t bg-blue-50/50
        ${bookingStatus === BookingStatus.DECLINED ? 'border-red-500' : 'border-yellow-400'}` : 'bg-white'}`}>
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 shadow-md flex-shrink-0">
          <AvatarImage
            src={!isFreelancer ? notification.booking.freelancer.image || '' : notification.booking.client.image || ''}
            alt={`${!isFreelancer ? notification.booking.freelancer.name : notification.booking.client.name}'s avatar`}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-amber-200 to-yellow-300 text-amber-800 text-2xl font-medium">
            {notification.booking.client.name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-2 items-start justify-between">
                <p className="text-gray-900">{statusMessage}</p>
                {!isClient && bookingStatus !== BookingStatus.PENDING && <div className="mt-1">{getStatusBadge(bookingStatus)}</div>}
              </div>
              {!notification.isRead && (
                <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
              )}
            </div>
            <div className="text-xs md:text-sm text-gray-500 flex justify-between items-center gap-1.5">
              <time>{exactTime}</time>
              <time>{timeAgo}</time>
            </div>
          </div>
          <div className="space-y-1 md:space-y-2">
            {notification.booking.description && (
              <p className="text-sm md:text-base text-gray-900 bg-gray-100 p-4 rounded-xl">
                {notification.booking.description}
              </p>
            )}
            {bookingStatus === BookingStatus.PENDING && isFreelancer && (
              <div className="flex items-center justify-start gap-2">
                <BookingActionButton
                  bookingId={notification.booking.id}
                  clientId={notification.booking.client.id}
                  freelancerId={notification.booking.freelancer.id}
                  handleAction={handleAction}
                  isActionLoading={isActionLoading}
                  className={"p-6"}
                  bookingEventType={BookingEventType.DECLINED}
                />
                <BookingActionButton
                  bookingId={notification.booking.id}
                  clientId={notification.booking.client.id}
                  freelancerId={notification.booking.freelancer.id}
                  handleAction={handleAction}
                  isActionLoading={isActionLoading}
                  className={"p-6"}
                  bookingEventType={BookingEventType.CONFIRMED}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BookingActionsButtonProps {
  bookingId: string;
  clientId: string;
  freelancerId: string;
  handleAction: ({
    actionData,
    bookingEventType,
    e }:
    {
      actionData: BookingActionData,
      bookingEventType: Exclude<BookingEventType, 'CREATED'>,
      e: React.MouseEvent
    }) => void;
  isActionLoading: boolean;
  className?: string;
  bookingEventType: Exclude<BookingEventType, 'CREATED'>;
  isDisabled?: boolean
}

interface DialogConfig {
  title: string;
  description: string;
  buttonText: string;
  buttonVariant: 'default' | 'destructive';
  buttonClass: string;
  triggerClass: string;
  triggerText: string;
}

export function BookingActionButton({
  bookingId,
  clientId,
  freelancerId,
  handleAction,
  isActionLoading,
  className,
  bookingEventType,
  isDisabled
}: BookingActionsButtonProps) {
  const actionData: BookingActionData = {
    bookingId,
    clientId,
    freelancerId
  };

  const getDialogConfig = (type: Exclude<BookingEventType, 'CREATED'>): DialogConfig => {
    const configs: Record<Exclude<BookingEventType, 'CREATED'>, DialogConfig> = {
      UPDATED: {
        title: "Are You Sure You Want to Update?",
        description: "Please confirm if you'd like to update this booking.",
        buttonText: "Confirm Update",
        buttonVariant: "default",
        buttonClass: "bg-blue-400 hover:bg-blue-500 text-gray-900",
        triggerClass: "text-gray-900 border border-gray-300 bg-blue-400 hover:bg-blue-500",
        triggerText: "Update"
      },
      RESCHEDULED: {
        title: "Are You Sure You Want to Reschedule?",
        description: "Please confirm if you'd like to reschedule this booking.",
        buttonText: "Confirm Reschedule",
        buttonVariant: "default",
        buttonClass: "bg-purple-400 hover:bg-purple-500 text-gray-900",
        triggerClass: "text-gray-900 border border-gray-300 bg-purple-400 hover:bg-purple-500",
        triggerText: "Reschedule"
      },
      CANCELLED: {
        title: "Are You Sure You Want to Cancel?",
        description: "Are you sure you want to cancel this booking? This action cannot be undone.",
        buttonText: "Confirm Cancellation",
        buttonVariant: "destructive",
        buttonClass: "bg-red-500 hover:bg-red-600",
        triggerClass: "text-white border border-gray-300 bg-red-600 hover:bg-red-700",
        triggerText: "Cancel"
      },
      COMPLETED: {
        title: "Mark as Completed?",
        description: "Are you sure you want to mark this booking as completed?",
        buttonText: "Confirm Completion",
        buttonVariant: "default",
        buttonClass: "bg-green-500 hover:bg-green-600 text-white",
        triggerClass: "text-white border border-gray-300 bg-green-500 hover:bg-green-600",
        triggerText: "Complete"
      },
      CONFIRMED: {
        title: "Confirm This Booking?",
        description: "Are you sure you want to confirm this booking?",
        buttonText: "Confirm Booking",
        buttonVariant: "default",
        buttonClass: "text-gray-900 border border-gray-300 bg-yellow-400 hover:bg-yellow-500",
        triggerClass: "text-gray-900 border border-gray-300 bg-yellow-400 hover:bg-yellow-500",
        triggerText: "Accept"
      },
      DECLINED: {
        title: "Are You Sure You Want to Decline?",
        description: "Are you sure you want to decline this booking request? This action cannot be undone.",
        buttonText: "Confirm Decline",
        buttonVariant: "destructive",
        buttonClass: "",
        triggerClass: "text-gray-900 border border-gray-300 hover:bg-gray-100",
        triggerText: "Decline"
      }
    };

    return configs[type];
  };

  const config = getDialogConfig(bookingEventType);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center gap-3 pt-2`}>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={bookingEventType === 'DECLINED' ? 'outline' : 'default'}
            disabled={isActionLoading || isDisabled}
            className={`flex items-center border rounded-xl font-medium active:scale-[0.95] ${config.triggerClass} ${className}`}
          >
            {config.triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl p-10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{config.title}</DialogTitle>
            <DialogDescription>
              {config.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex mt-4 gap-2 md:gap-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isActionLoading}
                className="md:px-6 py-8 md:py-6 w-full sm:w-auto rounded-xl"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant={config.buttonVariant}
              onClick={(e: React.MouseEvent) => {
                handleAction({ actionData, bookingEventType, e });
              }}
              disabled={isActionLoading}
              className={`md:px-6 py-8 md:py-6 w-full sm:w-auto rounded-xl ${config.buttonClass}`}
            >
              {isActionLoading ? <DotTypingLoading /> : config.buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse ml-2" />
        </div>
      </div>

      {/* Notification cards skeleton */}
      <div className="space-y-2 md:space-y-6">
        {[1, 2, 3].map((index) => (
          <NotificationCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
export function NotificationCardSkeleton() {
  return (
    <div className="p-8 bg-white shadow-lg rounded-xl">
      <div className="flex gap-4">
        {/* Avatar skeleton */}
        <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />

        <div className="flex-1 space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              {/* Status message skeleton */}
              <div className="flex gap-2 items-start justify-between">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              </div>
              {/* Unread indicator skeleton */}
              <div className="h-2 w-2 rounded-full bg-gray-200 animate-pulse" />
            </div>

            {/* Timestamp skeleton */}
            <div className="flex justify-between items-center gap-1.5">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          </div>

          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />

            {/* Action buttons skeleton */}
            <div className="flex gap-4 mt-4">
              <div className="h-10 bg-gray-200 rounded w-28 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-28 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
