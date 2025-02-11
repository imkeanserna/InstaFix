import { Post } from "@prisma/client/edge";
import { ResponseDataWithCursor, ResponseDataWithLocationAndCursor, GetPostsResponse, SearchWithPaginationOptions, DynamicPostWithIncludes, StaticPostWithIncludesWithHighlights, PostWithUserInfo } from "@repo/types";

type PostResponse = {
  success: boolean;
  data: {
    post: Post;
  };
  error?: string;
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
};

export async function draftPost() {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/create-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: PostResponse = await response.json();
    if (!result.success) {
      throw new Error("Failed to create post");
    }
    return result.data.post;
  } catch (error) {
    return null;
  }
}

type UpdatePost = {
  type: string;
  data: any;
  postId: string;
}

type UpdatePostResponse = {
  success: boolean;
  data: {
    post: any;
  };
  error?: string;
}

export async function updatePost({ type, data, postId }: UpdatePost) {
  try {
    if (type === 'media' && data.files.length > 0 && data.coverPhotoIndex !== undefined) {
      const formData = new FormData();

      formData.append('type', type);
      formData.append('coverPhotoIndex', data.coverPhotoIndex);

      data.files.forEach((file: File) => {
        formData.append('files', file);
      });

      const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/create-post/${postId}`, {
        method: 'PATCH',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const result: UpdatePostResponse = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get response from chat AI');
      }
      return result.data;
    } else {
      const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/create-post/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: type,
          data: data
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const result: UpdatePostResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get response from chat AI');
      }
      return result.data;
    }
  } catch (error) {
    return null;
  }
}

export async function getPreviewPost(postId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/create-post/${postId}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: PostResponse = await response.json();
    if (!result.success) {
      throw new Error("Failed to create post");
    }
    return result.data;
  } catch (error) {
    return null;
  }
}

type FindPostsResponse = {
  success: boolean;
  data: ResponseDataWithLocationAndCursor | ResponseDataWithCursor;
  error?: string;
}

export async function getPosts(params: SearchWithPaginationOptions = {}): Promise<GetPostsResponse> {
  const queryParams = new URLSearchParams();
  const paramMapping = {
    cursor: params.cursor,
    take: params.take?.toString(),
    categories: params.categoryIds,
    subcategories: params.subcategoryIds,
    search: params.searchQuery,
    complete: params.complete ? 'true' : undefined,
    latitude: params.location?.latitude?.toString(),
    longitude: params.location?.longitude?.toString(),
    radius: params.location?.radiusInKm?.toString() || '20',
    minPrice: params.price?.min?.toString(),
    maxPrice: params.price?.max?.toString(),
    priceType: params.price?.type?.toString(),
    engagementType: params.engagementType,
    minRating: params.minRating?.toString(),
    targetAudience: params.targetAudience,
    services: params.servicesIncluded?.length ? params.servicesIncluded.join(',') : undefined
  };

  Object.entries(paramMapping).forEach(([key, value]) => {
    if (value) {
      const formattedValue = Array.isArray(value) ? value.join(',') : value;
      queryParams.set(key, formattedValue);
    }
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `${process.env.NEXT_BACKEND_URL}/api/posts?${queryParams}`,
      {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FindPostsResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get response from chat AI');
    }

    return {
      data: result.data,
      nextCursor: result.data.posts.length > 0 ? result.data.pagination?.endCursor : undefined
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      data: [],
      nextCursor: undefined
    };
  }
}

type PostResponseById = {
  success: boolean;
  data: PostWithUserInfo;
  error?: string;
}

export async function getPost({ postId }: { postId: string }) {
  try {
    if (!postId) {
      return null;
    }

    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: PostResponseById = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get response from chat AI');
    }

    return result.data;
  } catch (error) {
    return null;
  }
}

type StaticPostResponse = {
  success: boolean;
  data: StaticPostWithIncludesWithHighlights;
  error?: string;
}

export async function getPostStatic({ postId }: { postId: string }) {
  try {
    if (!postId) {
      throw new Error('post id is required');
    }

    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/posts/${postId}/static`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: StaticPostResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get response from chat AI');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}

type DynamicPostResponse = {
  success: boolean;
  data: DynamicPostWithIncludes;
  error?: string;
}

export async function getPostDynamic({ postId }: { postId: string }) {
  try {
    if (!postId) {
      throw new Error('post id is required');
    }

    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/posts/${postId}/dynamic`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: DynamicPostResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get response from chat AI');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}
