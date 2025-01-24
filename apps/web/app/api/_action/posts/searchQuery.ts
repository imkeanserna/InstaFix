import { PopularSearch, Category, Subcategory } from '@prisma/client/edge';
import { SearchSuggestion } from '@repo/types';
import { prisma } from '@/server/index';

export const runtime = 'edge'

export async function getSearchSuggestions(
  partialQuery: string,
  limit = 5
): Promise<SearchSuggestion[]> {
  if (!partialQuery.trim()) {
    return [];
  }
  const searchTerm = partialQuery.toLowerCase().trim();

  // Get popular searches
  const popularSearches = await prisma.popularSearch.findMany({
    where: {
      OR: [
        { query: { startsWith: searchTerm, mode: 'insensitive' } },
        { query: { contains: searchTerm, mode: 'insensitive' } }
      ],
      // Only get recent searches (last 30 days)
      lastSearched: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    orderBy: [
      { count: 'desc' },
      { lastSearched: 'desc' }
    ],
    take: 20
  });

  // Get matching categories
  const categories = await prisma.category.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: 'insensitive'
      }
    },
    take: 20
  });

  // Get matching subcategories
  const subcategories = await prisma.subcategory.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: 'insensitive'
      }
    },
    include: {
      category: true
    },
    take: 20
  });

  // Get posts matching the search term
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { title: { startsWith: searchTerm, mode: 'insensitive' } },
        { title: { contains: searchTerm, mode: 'insensitive' } },
        {
          tags: {
            some: {
              subcategory: {
                OR: [
                  { name: { contains: searchTerm, mode: 'insensitive' } },
                  { category: { name: { contains: searchTerm, mode: 'insensitive' } } }
                ]
              }
            }
          }
        }
      ]
    },
    select: { title: true },
    distinct: ['title'],
    take: 50
  });

  function getBasePhrase(title: string): string {
    return title
      .split(/\s+/)
      .slice(0, 4)
      .join(' ')
      .toLowerCase();
  }

  const basePhrases = new Map<string, string>();
  const suggestions = new Set<{ text: string; type: 'popular' | 'post' | 'category' | 'subcategory' }>();

  // Add popular searches
  popularSearches.forEach((search: PopularSearch) => {
    suggestions.add({ text: search.query, type: 'popular' });
  });

  // Add categories
  categories.forEach((category: Category) => {
    suggestions.add({ text: category.name, type: 'category' });
  });

  // Add subcategories (with parent category)
  subcategories.forEach((subcategory: Subcategory & { category: Category }) => {
    suggestions.add({
      text: `${subcategory.category.name} › ${subcategory.name}`,
      type: 'subcategory'
    });
  });

  // Process titles and remove duplicates
  posts.forEach((post => {
    const title = post.title && post.title.trim();

    if (title) {
      const basePhrase = getBasePhrase(title);

      if (!basePhrases.has(basePhrase) ||
        title.length < basePhrases.get(basePhrase)!.length) {
        basePhrases.set(basePhrase, title);
      }
    }
  }));

  // Add unique post titles
  basePhrases.forEach((title) => {
    if (title.toLowerCase().includes(searchTerm)) {
      suggestions.add({ text: title, type: 'post' });
    }
  });

  function getSuggestionRelevance(suggestion: { text: string; type: string }): number {
    const lower = suggestion.text.toLowerCase();
    let score = 0;

    // Popular searches get highest priority
    if (suggestion.type === 'popular') {
      const popularSearch = popularSearches.find((popularSearch: PopularSearch) => popularSearch.query === lower);
      if (popularSearch) {
        score += popularSearch.count * 10;
        const daysSinceLastSearch = Math.floor(
          (Date.now() - popularSearch.lastSearched.getTime()) / (1000 * 60 * 60 * 24)
        );
        score += Math.max(0, 30 - daysSinceLastSearch) * 5;
      }
    }

    // Type-based priorities
    switch (suggestion.type) {
      case 'category':
        score += 700;
        break;
      case 'subcategory':
        score += 600;
        break;
      case 'popular':
        score += 500;
        break;
      case 'post':
        score += 400;
        break;
    }

    // Exact starts-with matches get high priority
    if (lower.startsWith(searchTerm)) {
      score += 800;
    }

    // Prefer suggestions between 2-4 words
    const wordCount = suggestion.text.split(/\s+/).length;
    if (wordCount >= 2 && wordCount <= 4) {
      score += 200;
    }

    // Shorter suggestions are better
    score -= suggestion.text.length * 0.5;
    return score;
  }

  return Array.from(suggestions)
    .filter(suggestion =>
      suggestion.text.length > searchTerm.length &&
      suggestion.text.toLowerCase() !== searchTerm &&
      suggestion.text.length <= 40 &&
      suggestion.text.split(/\s+/).length <= 6
    )
    .sort((a, b) => getSuggestionRelevance(b) - getSuggestionRelevance(a))
    .slice(0, limit);
}

export async function trackPopularSearch(query: string) {
  return prisma.popularSearch.upsert({
    where: {
      query: query.toLowerCase()
    },
    update: {
      count: { increment: 1 },
      lastSearched: new Date()
    },
    create: {
      query: query.toLowerCase()
    }
  });
}
