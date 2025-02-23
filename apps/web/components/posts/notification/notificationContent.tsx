"use client";

import { useNotificationContent } from "@/hooks/notification/useNotificationContent";
import { BookingStatus, PricingType } from "@prisma/client/edge";
import { useRouter } from "next/navigation";
import { BookingActions, getStatusMessage } from "./notifications";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Banknote, ChevronLeft, MapPin, Shield, Star } from "lucide-react";
import { Divider } from "../post/postContent";
import { User } from "next-auth";
import { TypeBookingNotificationById } from "@repo/types";
import { calculateRemainingDays, getFormattedTime, getTimeAgo } from "@/lib/dateFormatters";
import { PaymentOption } from "@/components/book/paymentMethod";
import { formatPrice } from "@/lib/postUtils";
import { Button } from "@repo/ui/components/ui/button";
import { capitalizeFirstLetter } from "@/lib/notificationUtils";

export function NotificationContent({ notificationId }: { notificationId: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    notification,
    bookingStatus,
    isLoading,
    error,
    isDeclineLoading,
    isAcceptLoading,
    handleDecline,
    handleAccept
  } = useNotificationContent(notificationId);

  if (isLoading || error || !notification || status === 'loading') {
    return <NotificationContentSkeleton />;
  }

  if (!session?.user || !session?.user?.id || !notificationId) {
    router.back();
    return null;
  }

  const isFreelancer = session.user.id === notification.booking.freelancer.id;
  const isClient = session.user.id === notification.booking.client.id;

  const handleCardPostClick = () => {
    if (notification?.booking?.post?.id) {
      router.push(`/find/${notification.booking.freelancer.name}/${notification.booking.post.title}/${notification?.booking?.post?.id}`);
    }
  }

  return (
    <div className="flex justify-center py-8">
      <div className="w-full px-4 sm:px-0 sm:w-11/12 md:w-10/12 lg:w-6/12">
        <div className="flex gap-2 md:gap-4 items-center pb-8">
          <Button
            variant="outline"
            className="rounded-full active:scale-95 px-4 py-6 border-none group"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
          </Button>
          <h1 className="text-xl sm:text-3xl font-medium">{capitalizeFirstLetter(isFreelancer ? notification?.booking?.client?.name! : notification?.booking?.freelancer?.name!)} has sent you a notification</h1>
        </div>
        <div className="px-0 sm:px-4">
          <NotificationHeader
            coverPhoto={notification?.booking?.post?.coverPhoto!}
            title={notification?.booking?.post?.title!}
            fullAddress={notification?.booking?.post.location?.fullAddress!}
            averageRating={notification?.booking?.post?.averageRating!}
            noOfReviews={notification?.booking?.post?.reviews.length!}
            postId={notification?.booking?.post?.id}
            handleCardPostClick={handleCardPostClick}
          />
        </div>
        <Divider marginY="my-8 sm:my-10" />
        <div className="px-0 sm:px-8">
          <UserMessage
            bookingStatus={bookingStatus!}
            notification={notification}
            user={session?.user as User}
            isFreelancer={isFreelancer}
            isClient={isClient}
          />
        </div>
        <Divider marginY="my-8 sm:my-10" />
        <div className="space-y-6 px-0 sm:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
          </div>
          <div className="space-y-4">
            <PaymentOption
              title="Cash Only"
              description="Pay directly to the freelancer upon service completion."
              icon={<Banknote className="h-4 w-4 lg:h-7 lg:w-7 text-yellow-700" />}
              selected
            />
          </div>
        </div>
        <Divider marginY="my-10" />
        <div className="px-0 sm:px-8">
          <div className="mt-2 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Price Details</h2>
            <div className="flex justify-between mb-2">
              <p className="underline">Checkout Date</p>
              <p>{new Date(notification?.booking?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              }</p>
            </div>
            <div className="flex justify-between mb-2">
              <p className="underline">Price per item</p>
              <p>₱{formatPrice((notification.booking.post.pricingType === PricingType.HOURLY ? notification.booking.post.hourlyRate || 0 : notification.booking.post.fixedPrice || 0))}.00</p>
            </div>
            <div className="flex justify-between mb-2">
              <p className="underline">Quantity</p>
              <p className="text-sm">x{notification.booking.quantity || 1}</p>
            </div>
          </div>
          <Divider marginY="my-10" />
          <div className="flex justify-between font-medium">
            <p>Total(PHP)</p>
            <p>₱{formatPrice(notification.booking.totalAmount)}.00</p>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              Note: The final price may vary based on the extent of the damage, the complexity of the repair, and any additional parts or services required to restore the item to optimal condition.
            </p>
          </div>
        </div>
        {isFreelancer &&
          (
            <>
              <Divider marginY="my-10" />
              <div className="px-0 sm:px-8">
                <CancellationPolicy createdAt={notification.booking.createdAt} maxDays={3} />
              </div>
              <Divider marginY="my-10" />
              <div className="space-y-6 bg-white rounded-xl px-0 sm:px-8">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Rules and Regulations</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      We ask every user to remember a few simple things about what makes a great user.
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg inline-block">
                  Note: Rules are designed to ensure a positive experience for both parties. Violation may result in account restrictions.
                </div>
              </div>
            </>
          )
        }
        {bookingStatus === BookingStatus.PENDING && (
          <>
            <Divider marginY="my-10" />
            <div className="space-y-6 px-0 sm:px-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">
                    By selecting the button below, I agree to the{" "}
                    <span className="text-blue-600 hover:underline cursor-pointer">Freelancer Service Terms</span>,{" "}
                    <span className="text-blue-600 hover:underline cursor-pointer">Community Guidelines</span>, and{" "}
                    <span className="text-blue-600 hover:underline cursor-pointer">Refund Policy</span>.
                    {`I also acknowledge that my payment method may be charged in accordance with the platform's policies.`}
                    I agree to pay the total amount shown if the freelancer accepts my booking request.
                  </p>
                </div>
              </div>
              <BookingActions
                bookingId={notification.booking.id}
                clientId={notification.booking.client.id}
                freelancerId={session?.user?.id}
                handleDecline={handleDecline}
                handleAccept={handleAccept}
                isDeclineLoading={isDeclineLoading}
                isAcceptLoading={isAcceptLoading}
                className={"px-12 w-full sm:w-auto py-8 sm:py-6"}
                position={"right"}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface NotificationHeaderProps {
  coverPhoto: string;
  title: string;
  fullAddress: string;
  averageRating: number;
  noOfReviews: number;
  postId: string;
  handleCardPostClick: () => void
}

export const NotificationHeader = ({
  coverPhoto,
  title,
  fullAddress,
  averageRating,
  noOfReviews,
  handleCardPostClick,
}: NotificationHeaderProps) => (
  <div
    onClick={handleCardPostClick}
    className="flex gap-6 cursor-pointer hover:bg-gray-100 p-4 rounded-2xl"
  >
    <Image
      src={coverPhoto}
      alt={title}
      width={150}
      height={150}
      className="rounded-2xl h-24 w-32 sm:h-32 sm:w-48 object-cover shadow-md border border-gray-500"
    />
    <div className="space-y-2">
      <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
      <div className="space-y-2">
        <div className="flex items-start space-x-1 text-xs">
          <MapPin className="h-4 w-4 text-gray-900" />
          <p>{fullAddress}</p>
        </div>
      </div>
      <div className="flex space-x-2 items-center">
        <Star className="h-4 w-4 text-gray-900 fill-gray-900" />
        <p className="text-sm font-semibold">{averageRating} </p>
        <span className="text-sm">({noOfReviews} {noOfReviews > 1 ? 'reviews' : 'review'})</span>
      </div>
    </div>
  </div>
);

interface UserMessageProps {
  notification: TypeBookingNotificationById;
  user: User;
  bookingStatus: BookingStatus;
  isFreelancer: boolean;
  isClient: boolean;
}

export const UserMessage = ({
  bookingStatus,
  notification,
  isFreelancer,
  isClient
}: UserMessageProps) => {
  const exactTime = getFormattedTime(new Date(notification.createdAt));
  const timeAgo = getTimeAgo(new Date(notification.createdAt));
  const formattedDate = new Date(notification.booking.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const statusMessage = getStatusMessage({
    status: bookingStatus,
    isFreelancer,
    isClient,
    clientName: notification.booking.client.name || '',
    freelancerName: notification.booking.freelancer.name || '',
    checkoutDate: formattedDate,
    postTitle: notification.booking.post.title || ''
  });

  return (
    <div
      className={`rounded-xl transition-colors`}>
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
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 flex justify-between items-center gap-1.5">
              <time>{exactTime}</time>
              <time>{timeAgo}</time>
            </div>
          </div>
          <div className="space-y-2">
            {notification.booking.description && (
              <p className="text-sm sm:text-base text-gray-900 bg-gray-100 p-4 rounded-xl">
                {notification.booking.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CancellationPolicy = ({ createdAt, maxDays }: {
  createdAt: Date;
  maxDays?: number
}) => {
  const remainingDays = calculateRemainingDays(createdAt, maxDays);
  const getDaysText = () => {
    if (remainingDays === 0) {
      return "less than a day";
    }
    if (remainingDays === 1) {
      return "1 day";
    }
    return `${remainingDays} days`;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Cancellation Policy</h2>
      <div className="mt-3 space-y-3">
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          {`You have ${getDaysText()} to accept this request. If you do not respond within this timeframe, the request may be canceled or reassigned. Repeated cancellations or failure to respond may result in restrictions on your account, including temporary suspension or loss of eligibility for new bookings.`}
        </div>
      </div>
    </div>
  );
};

export const NotificationContentSkeleton = () => {
  return (
    <div className="flex justify-center py-8 animate-pulse">
      <div className="w-full px-4 sm:px-0 sm:w-11/12 md:w-10/12 lg:w-6/12">
        {/* Header */}
        <div className="flex gap-4 items-center pb-8">
          <div className="h-12 w-12 bg-gray-200 rounded-full" />
          <div className="h-8 w-96 bg-gray-200 rounded-lg" />
        </div>

        {/* Notification Header */}
        <div className="px-4">
          <div className="rounded-xl overflow-hidden">
            <div className="h-48 bg-gray-200 w-full" />
          </div>
        </div>

        <div className="h-px bg-gray-200 my-10" />

        {/* User Message */}
        <div className="px-8">
          <div className="flex gap-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="h-5 bg-gray-200 w-3/4 rounded" />
              <div className="h-4 bg-gray-200 w-1/4 rounded" />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-10" />

        {/* Payment Method */}
        <div className="space-y-6 px-8">
          <div className="h-6 bg-gray-200 w-48 rounded" />
          <div className="p-4 border rounded-xl space-y-3">
            <div className="flex gap-3 items-center">
              <div className="h-7 w-7 bg-gray-200 rounded" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 w-1/3 rounded" />
                <div className="h-4 bg-gray-200 w-2/3 rounded" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-10" />

        {/* Payment Details */}
        <div className="px-8 space-y-4">
          <div className="h-6 bg-gray-200 w-48 rounded" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 w-32 rounded" />
                <div className="h-4 bg-gray-200 w-24 rounded" />
              </div>
            ))}
          </div>
          <div className="h-px bg-gray-200 my-6" />
          <div className="flex justify-between items-center font-medium">
            <div className="h-5 bg-gray-200 w-24 rounded" />
            <div className="h-5 bg-gray-200 w-32 rounded" />
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="h-4 bg-gray-200 w-full rounded" />
          </div>
        </div>

        <div className="h-px bg-gray-200 my-10" />

        {/* Cancellation Policy */}
        <div className="px-8 space-y-3">
          <div className="h-6 bg-gray-200 w-48 rounded" />
          <div className="h-20 bg-gray-100 rounded-lg" />
        </div>

        <div className="h-px bg-gray-200 my-10" />

        {/* Rules and Regulations */}
        <div className="px-8 space-y-4">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 w-48 rounded" />
            <div className="h-4 bg-gray-200 w-96 rounded" />
          </div>
          <div className="h-16 bg-gray-100 rounded-lg" />
        </div>

        {/* Action Buttons Section */}
        <div className="h-px bg-gray-200 my-10" />
        <div className="px-8 space-y-4">
          <div className="h-24 bg-gray-100 rounded-lg" />
          <div className="flex justify-end gap-3">
            <div className="h-10 w-24 bg-gray-200 rounded-xl" />
            <div className="h-10 w-24 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
