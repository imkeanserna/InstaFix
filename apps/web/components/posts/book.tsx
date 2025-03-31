"use client";

import { createBooking, getBook } from "@/lib/bookingUtils";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";
import { createBookingSchema } from "./post/bookingForm";
import { useEffect, useState } from "react";
import { z } from 'zod';
import { PricingType } from "@prisma/client/edge";
import { formatPrice, getPost } from "@/lib/postUtils";
import Image from "next/image";
import { PostWithUserInfo } from "@repo/types";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { getInitials } from "@/lib/profile";
import { Banknote, Check, ChevronLeft, CreditCard, Lock, MapPin, Shield, Smartphone, Star } from "lucide-react";
import { Divider } from "./post/postContent";
import ExpandableDescription from "./post/expandibleDescription";
import { addDays, format } from "date-fns";
import { DotTypingLoading } from "@repo/ui/components/ui/dot-typing-loading";
import { toast } from "@repo/ui/components/ui/sonner";
import { QuerySchema } from "@/hooks/useBooking";
import { useCurrency } from "@/hooks/useCurrency";

export function BookPage({ postId }: { postId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [post, setPost] = useState<PostWithUserInfo | null>(null);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const { currency } = useCurrency();

  const checkout = searchParams.get('checkout');
  const description = searchParams.get('description');
  const numberOfItems = searchParams.get('numberOfItems');
  const freelancerId = searchParams.get('freelancerId');
  const cancellationDeadline = addDays(new Date(), 1);
  const formattedDate = format(cancellationDeadline, "MMM d");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await getPost({ postId });
        if (postData) {
          setPost(postData);
        } else {
          setPostError('Failed to load post details');
          router.back();
        }
      } catch (error) {
        setPostError('Error loading post details');
        router.back();
      }
    };

    fetchPost();
  }, [postId, router]);

  useEffect(() => {
    const validateAndCheckAvailability = async () => {
      try {
        const validationResult = QuerySchema.safeParse({
          checkout,
          description,
          numberOfItems,
          freelancerId,
        });

        if (!validationResult.success) {
          const errorMessage = validationResult.error.errors[0]?.message;
          setValidationError(errorMessage);
          router.back();
          return;
        }

        const availabilityData = await getBook({
          postId,
          freelancerId: validationResult.data.freelancerId,
          date: new Date(validationResult.data.checkout)
        });

        setIsAvailable(availabilityData.isAvailable);
        if (!availabilityData.isAvailable) {
          router.back();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to validate booking';
        setValidationError(errorMessage);
        router.back();
      }
    };

    validateAndCheckAvailability();
  }, [postId, checkout, description, numberOfItems, freelancerId, router]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const bookingData = createBookingSchema.parse({
        date: checkout ? new Date(checkout) : new Date(),
        description,
        quantity: parseInt(numberOfItems || '1'),
      });

      const response = await createBooking({
        postId: postId,
        date: bookingData.date,
        description: bookingData.description,
        quantity: bookingData.quantity
      });

      if (response) {
        setBookSuccess(true);
        toast.success('Your request has been submitted successfully');
      }
    } catch (error) {
      toast.error('Failed requesting booking, Please try again');
    } finally {
      setIsLoading(false);
      router.back();
    }
  };

  if (postError || validationError) {
    router.back();
    return;
  }

  if (!post) {
    return <BookPageSkeleton />;
  }

  const hourlyRate = post?.hourlyRate ?? 0;
  const fixedPrice = post?.fixedPrice ?? 0;
  const totalPrice =
    post?.pricingType === PricingType.HOURLY
      ? parseInt(numberOfItems || '1', 10) * hourlyRate
      : parseInt(numberOfItems || '1', 10) * fixedPrice;

  return (
    <div className="w-full ">
      <div className="px-80 flex gap-4 items-center">
        <Button
          variant="outline"
          className="rounded-full active:scale-95 px-4 py-6 border-none group"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
        </Button>
        <h1 className="text-3xl font-medium">Request to book</h1>
      </div>
      <div className="flex justify-center items-start gap-24">
        <div className="w-[700px]">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
              <div className="flex items-center gap-2 text-gray-500">
                <Lock className="h-4 w-4" />
                <span className="text-sm">Secure checkout</span>
              </div>
            </div>
            <div className="space-y-4">
              {/* Mastercard */}
              <Button
                variant="outline"
                className="relative w-full p-10 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 border-2 border-gray-200 rounded-xl transition-all duration-300 opacity-70 cursor-not-allowed overflow-hidden group"
                disabled
              >
                <div className="absolute inset-0 bg-grid-gray-900/5" />
                <div className="flex gap-6 items-center w-full relative">
                  {/* Radio Button */}
                  <div className="w-5 h-5 flex items-center justify-center border-2 border-gray-400 rounded-full">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">MasterCard/Visa</p>
                      <span className="px-3 py-1 bg-gray-200/80 backdrop-blur-sm text-gray-600 rounded-full text-xs font-medium">Coming Soon</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Secure online payment via credit or debit card.</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md rotate-3 transition-transform group-hover:rotate-6">
                  <CreditCard className="h-7 w-7 text-blue-600" />
                </div>
              </Button>

              {/* GCash */}
              <Button
                variant="outline"
                className="relative w-full p-10 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 border-2 border-gray-200 rounded-xl transition-all duration-300 opacity-70 cursor-not-allowed overflow-hidden group"
                disabled
              >
                <div className="absolute inset-0 bg-grid-gray-900/5" />
                <div className="flex gap-6 items-center w-full relative">
                  {/* Radio Button */}
                  <div className="w-5 h-5 flex items-center justify-center border-2 border-gray-400 rounded-full">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">GCash</p>
                      <span className="px-3 py-1 bg-gray-200/80 backdrop-blur-sm text-gray-600 rounded-full text-xs font-medium">Coming Soon</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Convenient mobile payment through GCash.</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md rotate-3 transition-transform group-hover:rotate-6">
                  <Smartphone className="h-7 w-7 text-green-600" />
                </div>
              </Button>

              {/* Cash Only */}
              <Button
                variant="outline"
                className="relative w-full p-10 hover:bg-white border border-gray-900 rounded-xl transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-grid-yellow-900/5" />
                <div className="flex gap-6 items-center w-full relative">
                  {/* Radio Button */}
                  <div className="w-5 h-5 flex items-center justify-center border-2 border-gray-900 rounded-full">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">Cash Only</p>
                      <span className="px-3 py-1 bg-yellow-200/80 backdrop-blur-sm text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" /> Selected
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Pay directly to the freelancer upon service completion.</p>
                  </div>
                </div>
                <div className="bg-yellow-200 p-4 rounded-xl shadow-md rotate-3 transition-transform group-hover:rotate-6">
                  <Banknote className="h-7 w-7 text-yellow-700" />
                </div>
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock className="h-4 w-4" />
                <p className="text-xs">Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>
          <Divider marginY="my-6" />
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
          <Divider marginY="my-6" />
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
          <Divider marginY="my-6" />
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
        <div className="w-[500px]">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-300">
            {post && (
              <div>
                <div className="flex gap-4">
                  <Image
                    src={post?.coverPhoto!}
                    alt={post?.title!}
                    width={150}
                    height={150}
                    className="rounded-2xl h-28 w-28 object-cover shadow-md border border-gray-500"
                  />
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold">{post.title}</h2>
                    <div className="space-y-4">
                      <p className="text-xs text-gray-900 underline">Freelancer</p>
                      <div className="flex space-x-3">
                        <Avatar className="h-10 w-10 border border-gray-500">
                          <AvatarImage
                            src={post.user?.image || '/default-avatar.png'}
                            alt={post.user.name || 'User Avatar'}
                          />
                          <AvatarFallback>{getInitials(post.user.name!)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="capitalize text-sm">{post.user.name}</p>
                          <div className="flex items-start space-x-1">
                            <MapPin className="h-6 w-6 text-gray-900" />
                            <p className="text-xs">{post.location?.fullAddress}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <Star className="h-4 w-4 text-gray-900 fill-gray-900" />
                      <p className="text-sm font-semibold">{post.averageRating} </p>
                      <span className="text-sm">({post.reviews.length} {post.reviews.length > 1 ? 'reviews' : 'review'})</span>
                    </div>
                  </div>
                </div>
                <Divider marginY="my-6" />
                <p className="font-medium text-xl">Price details</p>
                <div className="mt-2 space-y-3">
                  <div className="flex justify-between mb-2">
                    <p className="underline">Description</p>
                    <ExpandableDescription
                      description={description!}
                      title='Book Description'
                      maxLength={30}
                    />
                  </div>
                  <div className="flex justify-between mb-2">
                    <p className="underline">Checkout Date</p>
                    <p>{new Date(checkout!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    }</p>
                  </div>
                  <div className="flex justify-between mb-2">
                    <p className="underline">Price per item</p>
                    <p>{currency === "PHP" ? "₱" : "$"}{formatPrice((post?.pricingType === PricingType.HOURLY ? post?.hourlyRate || 0 : post?.fixedPrice || 0))}.00</p>
                  </div>
                  <div className="flex justify-between mb-2">
                    <p className="underline">Quantity</p>
                    <p className="text-sm">x{numberOfItems || 1}</p>
                  </div>
                </div>
                <Divider marginY="my-6" />
                <div className="flex justify-between font-medium">
                  <p>Total({currency === "PHP" ? "PHP" : "USD"})</p>
                  <p>{currency === "PHP" ? "₱" : "$"}{formatPrice(totalPrice)}.00</p>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    Note: The final price may vary based on the extent of the damage, the complexity of the repair, and any additional parts or services required to restore the item to optimal condition.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BookPageSkeleton() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-80 flex gap-4 items-center">
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
      <div className="flex justify-center items-start gap-24">
        {/* Left Column */}
        <div className="w-[700px]">
          {/* Payment Method Section */}
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-7 w-40 bg-gray-200 animate-pulse rounded-lg" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-lg" />
              </div>
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

          {/* Divider */}
          <div className="my-6 h-px bg-gray-200" />

          {/* Cancellation Policy */}
          <div className="bg-white p-6 rounded-xl">
            <div className="h-7 w-48 bg-gray-200 animate-pulse rounded-lg mb-3" />
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          </div>

          {/* Divider */}
          <div className="my-6 h-px bg-gray-200" />

          {/* Rules Section */}
          <div className="space-y-6 p-6 bg-white rounded-xl">
            <div className="h-7 w-48 bg-gray-200 animate-pulse rounded-lg" />
            <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          </div>

          {/* Divider */}
          <div className="my-6 h-px bg-gray-200" />

          {/* Bottom Section */}
          <div className="p-6">
            <div className="space-y-6">
              <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[500px]">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-300">
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

            {/* Divider */}
            <div className="my-6 h-px bg-gray-200" />

            {/* Price Details */}
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-lg mb-4" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between mb-3">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-lg" />
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-lg" />
              </div>
            ))}

            {/* Divider */}
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
