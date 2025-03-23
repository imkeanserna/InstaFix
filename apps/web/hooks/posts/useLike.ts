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
import { useFavorites } from "../favorites/useFavorites";
import { TypeActionFavorite } from "@repo/types";

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
  const { addFavorite, removeFavorite } = useFavorites();

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
      const result: TypeActionFavorite | null = await addLike({ postId });

      if (!result?.favorite) {
        invalidatePostQueries(postId);
        setIsLiked(previousState);
        openModal();
      }

      if (result?.favorite && result?.isLike) {
        addFavorite({
          id: result.favorite?.id,
          post: {
            id: result.favorite.post.id,
            title: result.favorite.post.title,
            user: {
              name: result.favorite.post.user.name
            },
            location: {
              city: result.favorite.post.location?.city as string,
              state: result.favorite.post.location?.state as string,
              country: result.favorite.post.location?.country as string
            },
            averageRating: result.favorite.post.averageRating,
            coverPhoto: result.favorite.post.coverPhoto
          },
          user: {
            id: result.favorite.user.id,
            email: result.favorite.user.email,
            name: result.favorite.user.name
          },
          createdAt: result.favorite.createdAt
        });
      } else {
        if (result?.favorite.id) {
          removeFavorite(result.favorite?.id);
        }
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
  }, [
    postId,
    isLiked,
    session,
    updatePostLike,
    invalidatePostQueries,
    addFavorite,
    removeFavorite,
    openModal,
    isMobile,
    router
  ]);

  return {
    isLiked,
    toggleLike
  };
}
