"use clients";

import { addLike } from "@/lib/likesUtils";
import { Like } from "@prisma/client/edge";
import { toast } from "@repo/ui/components/ui/sonner";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePostLikeUpdate } from "./usePosts";
import { useAuthModal } from "@repo/ui/context/AuthModalProvider";
import { useMediaQuery } from "../useMedia";
import { useRouter } from "next/navigation";

interface UseLikeProps {
  postId: string;
  likes: Like[];
}

export function useLike({ postId, likes }: UseLikeProps) {
  const { data: session } = useSession();
  const isRequestInProgress = useRef(false);
  const hasUserLiked = likes?.some(like => like.userId === session?.user?.id) ?? false;
  const [isLiked, setIsLiked] = useState(hasUserLiked);
  const { updatePostLike, invalidatePostQueries } = usePostLikeUpdate();
  const { openModal } = useAuthModal();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();

  useEffect(() => {
    setIsLiked(likes?.some(like => like.userId === session?.user?.id) ?? false);
  }, [likes, session?.user?.id]);

  const toggleLike = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!session?.user && !session?.user?.id) {
      if (isMobile) {
        router.push("/auth/login");
        return;
      }
      openModal();
      return;
    }

    if (isRequestInProgress.current) {
      return;
    }

    const previousState = isLiked;
    setIsLiked(current => !current);

    const optimisticLike: Like = {
      id: `temp-${postId}-${session.user.id}`,
      userId: session.user.id as string,
      postId: postId,
      createdAt: new Date()
    };

    updatePostLike(postId, session?.user?.id as string, isLiked, optimisticLike);

    try {
      isRequestInProgress.current = true;
      const result: Like | null = await addLike({ postId });

      if (!result) {
        invalidatePostQueries(postId);
        setIsLiked(previousState);
        openModal();
      }
    } catch (error) {
      invalidatePostQueries(postId);
      setIsLiked(previousState);
      toast.error('Failed to update like, try again later.');
    } finally {
      setTimeout(() => {
        isRequestInProgress.current = false;
      }, 300);
    }
  }, [postId, isLiked, session, updatePostLike, invalidatePostQueries]);

  return {
    isLiked,
    toggleLike
  };
}
