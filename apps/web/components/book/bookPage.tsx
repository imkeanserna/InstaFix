"use client";

import { useBooking } from "@/hooks/useBooking";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronLeft, Shield } from "lucide-react";
import { useRouter } from 'next/navigation';
import { PaymentMethod } from "./paymentMethod";
import { Divider } from "../posts/post/postContent";
import { BookingSummary, PostHeader, PriceDetails, TotalPrice } from "./bookingSummary";
import { DotTypingLoading } from "@repo/ui/components/ui/dot-typing-loading";
import { addDays, format } from "date-fns";
import { useSession } from "next-auth/react";
import { BookingSuccessModal } from "./bookingSuccessModal";
import { useState } from "react";
import { useCurrency } from "@/hooks/useCurrency";

export function BookPage({ postId }: { postId: string }) {
  const router = useRouter();
  const {
    isLoading,
    validationError,
    post,
    bookSuccess,
    postError,
    checkout,
    description,
    numberOfItems,
    handleSubmit
  } = useBooking(postId);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const cancellationDeadline = addDays(new Date(), 1);
  const formattedDate = format(cancellationDeadline, "MMM d");
  const { data: session } = useSession();
  const { currency } = useCurrency();

  if (postError || validationError || (session?.user && session?.user.id === post?.userId)) {
    router.back();
    return null;
  }

  if (!post) {
    return <BookPageSkeleton />;
  }

  return (
    <div className="w-full space-y-8 mt-8">
      <div className="ps-0 lg:ps-56 flex gap-4 items-center">
        <Button
          variant="outline"
          className="rounded-full active:scale-95 px-4 py-6 border-none group"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
        </Button>
        <h1 className="text-3xl font-medium">Request to book</h1>
      </div>
      <div className="flex justify-center items-start gap-8 lg:gap-24">
        <div className="w-full md:w-[400px] lg:w-[700px]">
          <div className="block md:hidden">
            <div className="px-6">
              <PostHeader post={post} />
            </div>
            <Divider marginY="my-6" height="h-[8px] md:h-[1px]" />
          </div>
          <div className="px-6 md:px-0">
            <PaymentMethod />
          </div>
          <Divider marginY="my-6" height="h-[8px] md:h-[1px]" />
          <div className="block md:hidden">
            <div className="px-6">
              <PriceDetails
                post={post}
                description={description!}
                checkout={checkout!}
                numberOfItems={numberOfItems!}
                currency={currency}
              />
            </div>
            <Divider marginY="my-6" height="h-[8px] md:h-[1px]" />
            <div className="px-6">
              <TotalPrice
                post={post}
                numberOfItems={numberOfItems!}
                currency={currency}
              />
            </div>
            <Divider marginY="my-6" height="h-[8px] md:h-[1px]" />
          </div>
          <div className="bg-white p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Cancellation Policy</h2>
                <div className="mt-3 space-y-3">
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    {`Cancel within 24 hours of booking. After that, cancel before ${formattedDate} to avoid issues before the freelancer accepts your request.`}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Divider marginY="my-6" height="h-[8px] md:h-[1px]" />
          <div className="space-y-6 p-6 bg-white rounded-xl">
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
          <Divider marginY="my-6" height="h-[8px] md:h-[1px]" />
          <div className="p-6">
            <div className="space-y-6">
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
              <Button
                onClick={handleSubmit}
                disabled={bookSuccess || isLoading}
                className="py-8 px-12 w-full rounded-xl bg-yellow-500 text-white hover:bg-yellow-400 hover:border hover:border-gray-900 hover:text-gray-900">
                {isLoading ? <DotTypingLoading /> : "Request to book"}
              </Button>
            </div>
          </div>
        </div>
        <div className="w-[400px] lg:w-[500px] hidden md:flex">
          <BookingSummary
            post={post}
            description={description!}
            checkout={checkout!}
            numberOfItems={numberOfItems!}
            currency={currency}
          />
        </div>
      </div>
      {post.title && (
        <BookingSuccessModal
          isOpen={bookSuccess || showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            router.back();
          }}
          postTitle={post?.title}
        />
      )}
    </div>
  );
}

export function BookPageSkeleton() {
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="ps-0 lg:ps-56 flex gap-4 items-center">
        <Button
          variant="outline"
          className="rounded-full px-4 py-6 border-none"
          disabled
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg" />
      </div>

      {/* Main Content */}
      <div className="flex justify-center items-start gap-8 lg:gap-24">
        {/* Left Column */}
        <div className="w-full md:w-[400px] lg:w-[700px]">
          {/* Mobile Post Header - Only visible on mobile */}
          <div className="block md:hidden">
            <div className="px-6">
              <div className="flex gap-4">
                <div className="h-28 w-28 bg-gray-200 animate-pulse rounded-2xl" />
                <div className="space-y-4 flex-1">
                  <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-lg" />
                    <div className="flex space-x-3">
                      <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-lg" />
                        <div className="h-4 w-48 bg-gray-200 animate-pulse rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[8px] md:h-[1px] bg-gray-200 my-6" />
          </div>

          {/* Payment Method Section */}
          <div className="px-6 md:px-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-7 w-40 bg-gray-200 animate-pulse rounded-lg" />
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-lg" />
              </div>

              {/* Payment Options */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full p-10 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="h-[8px] md:h-[1px] bg-gray-200 my-6" />

          {/* Mobile Price Details - Only visible on mobile */}
          <div className="block md:hidden">
            <div className="px-6 space-y-6">
              {/* Price Details */}
              <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-lg" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-lg" />
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-lg" />
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between">
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded-lg" />
                <div className="h-5 w-32 bg-gray-200 animate-pulse rounded-lg" />
              </div>
            </div>
            <div className="h-[8px] md:h-[1px] bg-gray-200 my-6" />
          </div>

          {/* Cancellation Policy */}
          <div className="bg-white p-6 rounded-xl">
            <div className="h-7 w-48 bg-gray-200 animate-pulse rounded-lg mb-3" />
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          </div>

          <div className="h-[8px] md:h-[1px] bg-gray-200 my-6" />

          {/* Rules Section */}
          <div className="space-y-6 p-6 bg-white rounded-xl">
            <div className="h-7 w-48 bg-gray-200 animate-pulse rounded-lg" />
            <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          </div>

          <div className="h-[8px] md:h-[1px] bg-gray-200 my-6" />

          {/* Bottom Section */}
          <div className="p-6">
            <div className="space-y-6">
              <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Column - Booking Summary - Hidden on mobile */}
        <div className="w-[400px] lg:w-[500px] hidden md:flex">
          <div className="w-full bg-white p-6 rounded-xl shadow border border-gray-300">
            {/* Post Info */}
            <div className="flex gap-4">
              <div className="h-28 w-28 bg-gray-200 animate-pulse rounded-2xl" />
              <div className="space-y-4 flex-1">
                <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="flex space-x-3">
                    <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-lg" />
                      <div className="h-4 w-48 bg-gray-200 animate-pulse rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="h-4 w-36 bg-gray-200 animate-pulse rounded-lg" />
              </div>
            </div>

            <div className="my-6 h-px bg-gray-200" />

            {/* Price Details */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-lg" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-lg" />
                </div>
              ))}
            </div>

            <div className="my-6 h-px bg-gray-200" />

            {/* Total */}
            <div className="flex justify-between">
              <div className="h-5 w-24 bg-gray-200 animate-pulse rounded-lg" />
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
