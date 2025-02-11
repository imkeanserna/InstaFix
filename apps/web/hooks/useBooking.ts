"use clients";

import { createBookingSchema } from "@/components/posts/post/bookingForm";
import { createBooking, getBook } from "@/lib/bookingUtils";
import { getPost } from "@/lib/postUtils";
import { PostWithUserInfo } from "@repo/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@repo/ui/components/ui/sonner";
import { z } from "zod";

export const QuerySchema = z.object({
  freelancerId: z.string({
    required_error: "freelancerId is required",
    invalid_type_error: "freelancerId must be a string"
  }).min(1, "freelancerId cannot be empty"),
  checkout: z.string({
    required_error: "date is required",
    invalid_type_error: "date must be a string"
  }).refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, "Invalid date format")
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const inputDate = new Date(date);
      inputDate.setHours(0, 0, 0, 0);

      return inputDate >= today;
    }, "Cannot book dates in the past"),
  description: z.string().min(1, "Description cannot be empty"),
  numberOfItems: z.string().refine((val) => {
    const parsedNumber = parseInt(val || "1");
    return !isNaN(parsedNumber) && parsedNumber > 0;
  }, "Number of items must be a valid positive number"),
});

export const useBooking = (postId: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [post, setPost] = useState<PostWithUserInfo | null>(null);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const checkout = searchParams.get('checkout');
  const description = searchParams.get('description');
  const numberOfItems = searchParams.get('numberOfItems');
  const freelancerId = searchParams.get('freelancerId');

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
          setValidationError(validationResult.error.errors[0]?.message);
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

  return {
    isLoading,
    validationError,
    isAvailable,
    post,
    bookSuccess,
    postError,
    checkout,
    description,
    numberOfItems,
    handleSubmit
  };
};

