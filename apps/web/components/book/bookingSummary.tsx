"use client";

import { PricingType } from "@prisma/client/edge";
import { PostWithUserInfo } from "@repo/types";
import { Divider } from "../posts/post/postContent";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { getInitials } from "@/lib/profile";
import { MapPin, Star } from "lucide-react";
import ExpandableDescription from "../posts/post/expandibleDescription";
import { formatPrice } from "@/lib/postUtils";
import { Currency, useCurrency } from "@/hooks/useCurrency";

interface BookingSummaryProps {
  post: PostWithUserInfo;
  description: string;
  checkout: string;
  numberOfItems: string;
  currency: Currency;
}

export const BookingSummary = (props: BookingSummaryProps) => {
  const { post } = props;
  const { currency } = useCurrency();

  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl shadow border border-gray-300">
      {post && (
        <div>
          <PostHeader post={post} />
          <Divider marginY="my-6" />
          <PriceDetails {...props} currency={currency} />
          <Divider marginY="my-6" />
          <TotalPrice post={post} numberOfItems={props.numberOfItems} currency={currency} />
        </div>
      )}
    </div>
  );
};

export const PostHeader = ({ post }: { post: PostWithUserInfo }) => (
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
);

export const PriceDetails = ({
  post,
  description,
  checkout,
  numberOfItems,
  currency
}: BookingSummaryProps) => (
  <div>
    <p className="font-medium text-xl">Price details</p>
    <div className="mt-2 space-y-3">
      <div className="flex justify-between mb-2">
        <p className="underline">Description</p>
        <div className="text-end">
          <ExpandableDescription
            description={description!}
            title='Booking Request Description'
            maxLength={30}
          />
        </div>
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
  </div>
);

export const TotalPrice = ({ post, numberOfItems, currency }: { post: PostWithUserInfo, numberOfItems: string, currency: Currency }) => {
  const hourlyRate = post?.hourlyRate ?? 0;
  const fixedPrice = post?.fixedPrice ?? 0;
  const totalPrice =
    post?.pricingType === PricingType.HOURLY
      ? parseInt(numberOfItems || '1', 10) * hourlyRate
      : parseInt(numberOfItems || '1', 10) * fixedPrice;

  return (
    <div>
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
  );
};
