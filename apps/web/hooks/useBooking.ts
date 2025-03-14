"use clients";

import { createBookingSchema } from "@/components/posts/post/bookingForm";
import { getBook } from "@/lib/bookingUtils";
import { getPost } from "@/lib/postUtils";
import { ErrorPayload, MessageType, NotificationType, PostWithUserInfo } from "@repo/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@repo/ui/components/ui/sonner";
import { z } from "zod";
import { useWebSocket } from "./useWebSocket";
import { WebSocketMessage } from "@/context/WebSocketProvider";
import { BookingEventType } from "@prisma/client/edge";

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
  const { sendMessage, lastMessage, clearMessage } = useWebSocket();
  const { requestBooking } = useBookingAction(sendMessage);

  const checkout = searchParams.get('checkout');
  const description = searchParams.get('description');
  const numberOfItems = searchParams.get('numberOfItems');
  const freelancerId = searchParams.get('freelancerId');

  useBookingMessage({
    lastMessage,
    setIsLoading,
    onBookingCreated: () => {
      setBookSuccess(true);
      clearMessage();
    },
    onError: (errorPayload) => {
      toast.error(errorPayload.details || errorPayload.error);
      clearMessage();
    }
  });

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

      requestBooking(MessageType.BOOKING, {
        postId,
        date: bookingData.date,
        description: bookingData.description,
        quantity: bookingData.quantity
      })
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed requesting booking, Please try again');
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

export function useBookingActions() {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { lastMessage, clearMessage } = useWebSocket();

  const resetLoadingStates = useCallback(() => {
    setIsActionLoading(false);
  }, []);

  useBookingMessage({
    lastMessage,
    setIsLoading: (loading: boolean) => {
      setIsActionLoading(loading);
    },
    onBookingCreated: () => {
      resetLoadingStates();
      clearMessage();
    },
    onError: (errorPayload) => {
      toast.error(errorPayload.details || errorPayload.error);
      clearMessage();
    }
  });

  return {
    isActionLoading,
    setIsActionLoading,
    resetLoadingStates
  };
}

interface BookingCreateData {
  postId: string;
  date: Date;
  description: string;
  quantity: number;
}

interface BookingUpdateData {
  bookingId: string;
  clientId: string;
  freelancerId: string;
}

export type BookingActionData = BookingUpdateData & Partial<{ date: Date }>;

export function useBookingAction(sendMessage: Function) {
  const requestBooking = useCallback(
    (event: MessageType, data: BookingCreateData) => {
      const payload = {
        type: BookingEventType.CREATED,
        payload: {
          postId: data.postId,
          date: data.date,
          description: data.description,
          quantity: data.quantity
        }
      }
      sendMessage(event, payload);
    },
    [sendMessage]
  );

  const handleBookingAction = useCallback(
    (
      event: MessageType,
      type: Exclude<BookingEventType, "CREATED">,
      data: BookingActionData
    ) => {
      const payload = {
        type,
        payload: {
          bookingId: data.bookingId,
          clientId: data.clientId,
          freelancerId: data.freelancerId,
          ...(data.date && { date: data.date })
        }
      };
      sendMessage(event, payload);
    },
    [sendMessage]
  );

  return {
    requestBooking,
    handleBookingAction
  };
}

interface UseBookingMessageProps {
  lastMessage: WebSocketMessage | null;
  onBookingCreated?: () => void;
  onError?: (error: ErrorPayload) => void;
  setIsLoading?: (loading: boolean) => void;
}

export function useBookingMessage({
  lastMessage,
  onBookingCreated,
  onError,
  setIsLoading,
}: UseBookingMessageProps) {
  useEffect(() => {
    if (!lastMessage) return;

    setIsLoading && setIsLoading(false);

    switch (lastMessage.type) {
      case MessageType.ERROR:
        const errorPayload = lastMessage.payload as ErrorPayload;
        toast.error(errorPayload.details || errorPayload.error);
        onError?.(errorPayload);
        break;

      case MessageType.BOOKING:
        switch (lastMessage.action) {
          case BookingEventType.CREATED:
            onBookingCreated?.();
            break;
          case BookingEventType.CANCELLED:
            onBookingCreated?.();
            break;
          case BookingEventType.RESCHEDULED:
            break;
          case BookingEventType.CONFIRMED:
            onBookingCreated?.();
            break;
          case BookingEventType.UPDATED:
            break;
        }
        break;

      case MessageType.NOTIFICATION:
        switch (lastMessage.action) {
          case NotificationType.BOOKING:
            onBookingCreated?.();
            break;
          case NotificationType.CHAT:
            break;
        }
        break;
    }
  }, [lastMessage, onBookingCreated, onError, setIsLoading]);
}
