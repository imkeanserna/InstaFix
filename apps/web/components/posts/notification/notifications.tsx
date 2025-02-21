"use client";

import { useNotificationCard, useNotifications } from "@/hooks/notification/useNotifications";
import { MessageType, NotificationType, TypeBookingNotification } from "@repo/types";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { Badge, Bell } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { BookingActionData, useBookingAction, useBookingActions, useBookingMessage } from "@/hooks/useBooking";
import { BookingEventType, BookingStatus } from "@prisma/client/edge";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { capitalizeFirstLetter } from "@/lib/notificationUtils";
import { DotTypingLoading } from "@repo/ui/components/ui/dot-typing-loading";
import { useRouter } from "next/navigation";

export function Notifications() {
  const { notificationState, addNotification, error, isLoading } = useNotifications();
  const { sendMessage, lastMessage, clearMessage } = useWebSocket();
  const { handleBookingAction } = useBookingAction(sendMessage);
  const { data: session } = useSession();

  useBookingMessage({
    lastMessage,
    onBookingCreated: () => {
      if (lastMessage?.type === MessageType.NOTIFICATION && lastMessage?.action === NotificationType.BOOKING) {
        addNotification(lastMessage?.payload as TypeBookingNotification);
      }
      clearMessage();
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      clearMessage();
    }
  });

  if (isLoading || error || !session?.user || !session?.user?.id) {
    return <NotificationsSkeleton />;
  }

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {notificationState.count > 0 && (
            <Badge variant="destructive" className="ml-2">
              {notificationState.count}
            </Badge>
          )}
        </div>
      </div>
      {notificationState.notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-6">
          {notificationState.notifications.map((notification: TypeBookingNotification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onAccept={handleBookingAction}
              onDecline={handleBookingAction}
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

const getStatusMessage = ({
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
  onDecline: (
    event: MessageType,
    type: Exclude<BookingEventType, "CREATED">,
    data: BookingActionData
  ) => void;
  onAccept: (
    event: MessageType,
    type: Exclude<BookingEventType, "CREATED">,
    data: BookingActionData
  ) => void;
  user: User
}

export function NotificationCard({
  notification,
  onDecline,
  onAccept,
  user
}: NotificationCardProps) {
  const {
    bookingStatus,
    setBookingStatus,
    formattedDate,
    isFreelancer,
    isClient,
    exactTime,
    timeAgo
  } = useNotificationCard(notification, user);
  const router = useRouter();

  const {
    isDeclineLoading,
    isAcceptLoading,
    setIsDeclineLoading,
    setIsAcceptLoading,
    resetLoadingStates
  } = useBookingActions();

  const handleDecline = async ({ actionData, e }: { actionData: BookingActionData, e: React.MouseEvent }) => {
    e.stopPropagation();
    setIsDeclineLoading(true);
    try {
      await onDecline(MessageType.BOOKING, BookingEventType.DECLINED, actionData);
      setBookingStatus('DECLINED');
    } catch (error) {
      console.error('Error declining booking:', error);
      resetLoadingStates();
    }
  };

  const handleAccept = async ({ actionData, e }: { actionData: BookingActionData, e: React.MouseEvent }) => {
    e.stopPropagation();
    setIsAcceptLoading(true);
    try {
      await onAccept(MessageType.BOOKING, BookingEventType.CONFIRMED, actionData);
      setBookingStatus('CONFIRMED');
    } catch (error) {
      console.error('Error accepting booking:', error);
      resetLoadingStates();
    }
  };

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
    router.push(`/notifications/${notification.booking.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`p-8 hover:bg-gray-50 bg-white shadow-lg rounded-xl transition-colors cursor-pointer 
        ${!notification.isRead ? `border-l-[10px] border-t 
        ${bookingStatus === BookingStatus.DECLINED ? 'border-red-500' : 'border-yellow-400'}` : ''}`}>
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 shadow-md flex-shrink-0">
          <AvatarImage
            src={isFreelancer ? notification.booking.freelancer.image || '' : notification.booking.client.image || ''}
            alt={`${isFreelancer ? notification.booking.freelancer.name : notification.booking.client.name}'s avatar`}
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
            <div className="text-sm text-gray-500 flex justify-between items-center gap-1.5">
              <time>{exactTime}</time>
              <time>{timeAgo}</time>
            </div>
          </div>

          <div className="space-y-2">
            {notification.booking.description && (
              <p className="text-gray-900 bg-gray-100 p-4 rounded-xl">
                {notification.booking.description}
              </p>
            )}
            {bookingStatus === BookingStatus.PENDING && isFreelancer && (
              <BookingActions
                bookingId={notification.booking.id}
                clientId={notification.booking.client.id}
                freelancerId={user?.id as string}
                handleDecline={handleDecline}
                handleAccept={handleAccept}
                isDeclineLoading={isDeclineLoading}
                isAcceptLoading={isAcceptLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BookingActionsProps {
  bookingId: string;
  clientId: string;
  freelancerId: string;
  handleDecline: ({ actionData, e }: { actionData: BookingActionData, e: React.MouseEvent }) => void;
  handleAccept: ({ actionData, e }: { actionData: BookingActionData, e: React.MouseEvent }) => void;
  isDeclineLoading: boolean;
  isAcceptLoading: boolean
}

export function BookingActions({
  bookingId,
  clientId,
  freelancerId,
  handleDecline,
  handleAccept,
  isDeclineLoading,
  isAcceptLoading
}: BookingActionsProps) {
  const actionData: BookingActionData = {
    bookingId,
    clientId,
    freelancerId
  };

  return (
    <div className="flex items-center gap-3 pt-2">
      <Button
        variant="outline"
        onClick={(e: React.MouseEvent) => {
          handleDecline({ actionData, e });
        }}
        disabled={isDeclineLoading || isAcceptLoading}
        className="flex items-center text-gray-900 border border-gray-300 px-5 rounded-xl hover:bg-gray-100 font-medium active:scale-[0.95]"
      >
        {isDeclineLoading ? <DotTypingLoading /> : "Decline"}
      </Button>
      <Button
        onClick={(e: React.MouseEvent) => {
          handleAccept({ actionData, e });
        }}
        disabled={isDeclineLoading || isAcceptLoading}
        className="flex items-center text-gray-900 border border-gray-300 px-5 rounded-xl bg-yellow-400 hover:bg-yellow-500 font-medium active:scale-[0.95]"
      >
        {isAcceptLoading ? <DotTypingLoading /> : "Accept"}
      </Button>
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
      <div className="space-y-6">
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
