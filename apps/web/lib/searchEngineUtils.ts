import { SearchSuggestion } from "@repo/types";
import { PopularSearch } from "@prisma/client/edge";

type SearchSuggestionResponse = {
  success: boolean;
  data: SearchSuggestion[];
  error?: string;
}

export async function getSearchSuggestions({ query, limit = 5, signal }: {
  query: string,
  limit: number,
  signal?: AbortSignal
}) {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/searchSuggestions?q=${query}&limit=${limit}`, {
      signal: signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: SearchSuggestionResponse = await response.json();
    if (!result.success) {
      throw new Error("Failed to create post");
    }
    return result.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

type PopularSearchResponse = {
  success: boolean;
  data: PopularSearch[];
  error?: string;
}

export async function getPopularSearchSuggestions({ limit = 10, signal }: {
  limit: number,
  signal?: AbortSignal
}) {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/popularSearch?limit=${limit}`, {
      signal: signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: PopularSearchResponse = await response.json();
    if (!result.success) {
      throw new Error("Failed to create post");
    }
    return result.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export const SEARCH_SUGGESTIONS = {
  popular: {
    src: "/search-engine/popular-search.webp",
    alt: "Popular",
    width: 56,
    height: 62
  },
  post: {
    src: "/search-engine/post-search.webp",
    alt: "Post",
    width: 56,
    height: 62
  },
  category: {
    src: "/search-engine/category-search.webp",
    alt: "Category",
    width: 56,
    height: 62
  },
  subcategory: {
    src: "/search-engine/subcategory-search.webp",
    alt: "Subcategory",
    width: 56,
    height: 62
  },
  default: {
    src: "/search-engine/default-search.webp",
    alt: "Default",
    width: 56,
    height: 62
  }
};
