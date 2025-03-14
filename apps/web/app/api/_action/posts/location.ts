import { prisma } from '@/server/index';
import { PostLocation, PostWithUserInfo } from '@repo/types';

// export const runtime = 'edge'

export function getLocationBasedQuery(
  location: { latitude: number; longitude: number; radiusInKm: number },
) {
  return {
    location: {
      latitude: {
        gte: location.latitude - (location.radiusInKm / 111),
        lte: location.latitude + (location.radiusInKm / 111),
      },
      longitude: {
        gte: location.longitude - (location.radiusInKm / (111 * Math.cos(location.latitude * (Math.PI / 180)))),
        lte: location.longitude + (location.radiusInKm / (111 * Math.cos(location.latitude * (Math.PI / 180)))),
      },
    },
  };
}

export function processLocationBasedPosts(
  posts: PostWithUserInfo[],
  location: {
    latitude: number; longitude: number,
  },
  searchRadius: number
) {
  const postsWithDistance = posts.map((post) => ({
    ...post,
    distance: post.location
      ? calculateDistance(
        location.latitude,
        location.longitude,
        post.location.latitude,
        post.location.longitude
      )
      : Infinity
  }));

  return postsWithDistance.sort((a, b) => {
    const scoreA = calculatePostScore(a, searchRadius);
    const scoreB = calculatePostScore(b, searchRadius);
    return scoreB - scoreA;
  });
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Return distance in kilometers
  return R * c;
}

function calculatePostScore(post: (PostWithUserInfo & { distance: number }), searchRadius: number) {
  // Increased from 0.35 - Rating is most important
  // Decreased from 0.25 - Distance is still relevant but not dominant
  // Increased from 0.20 - Give more weight to proven services
  // Decreased from 0.15
  // Kept the same
  const weights = {
    rating: 0.45,
    distance: 0.15,
    reviews: 0.25,
    updated: 0.10,
    created: 0.05
  };

  // Calculate confidence-adjusted rating
  const reviewCount = post.reviews.length;
  const averageRating = post.averageRating ?? 0;

  // Wilson score confidence adjustment
  const z = 1.96; // 95% confidence
  const n = reviewCount;
  const p = averageRating / 5; // Convert to 0-1 scale

  let confidenceAdjustedRating = 0;
  if (n > 0) {
    const left = p + (z * z) / (2 * n);
    const right = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
    const under = 1 + (z * z) / n;
    confidenceAdjustedRating = (left - right) / under;
  } else if (averageRating > 0) {
    // If we have a rating but no reviews (data inconsistency),
    // we'll still consider the rating but with a penalty
    confidenceAdjustedRating = (averageRating / 5) * 0.7; // 30% penalty
  }

  // Dynamic distance scoring based on search radius
  const distanceInKm = post.distance;
  let distanceScore;

  if (distanceInKm <= searchRadius * 0.2) {
    // Full score for very close posts (within 20% of search radius)
    distanceScore = 1;
  } else if (distanceInKm <= searchRadius * 0.6) {
    // Gradual decline up to 60% of search radius
    distanceScore = 0.8 - (0.4 * (distanceInKm - searchRadius * 0.2) / (searchRadius * 0.4));
  } else {
    // Slower decline for the rest
    distanceScore = 0.4 * Math.exp(-0.02 * (distanceInKm - searchRadius * 0.6));
  }

  // Reviews normalization
  const reviews = Math.min(reviewCount / 20, 1);

  // Time factors
  const daysSinceUpdate = Math.min(getDaysSince(post.updatedAt) / 30, 1);
  const daysSinceCreation = Math.min(getDaysSince(post.createdAt) / 90, 1);

  // New post bonus (smaller now since we handle ratings differently)
  const isNew = getDaysSince(post.createdAt) < 14;
  const newPostBonus = isNew && reviewCount === 0 ? 0.15 : 0; // Reduced from 0.3 to 0.15

  return (
    (weights.rating * confidenceAdjustedRating) +
    (weights.distance * distanceScore) +
    (weights.reviews * reviews) +
    (weights.updated * (1 - daysSinceUpdate)) +
    (weights.created * (1 - daysSinceCreation)) +
    newPostBonus
  );
}

function getDaysSince(date: Date): number {
  return (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
}

export async function findOrCreateLocation(locationData: PostLocation) {
  const normalizedAddress = normalizeAddress(locationData.address);

  try {
    // First, try to find an existing location
    const existingLocation = await prisma.location.findFirst({
      where: {
        OR: [
          { normalizedAddress },
          {
            AND: {
              latitude: locationData.lat,
              longitude: locationData.lng,
            }
          }
        ]
      }
    });

    if (existingLocation) {
      return existingLocation;
    }

    // If no existing location found, fetch details from Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${locationData.lat}&lon=${locationData.lng}&format=json`
    );
    const nominatimData: any = await response.json();

    // Create new location
    const newLocation = await prisma.location.create({
      data: {
        fullAddress: locationData.address,
        normalizedAddress,
        latitude: locationData.lat,
        longitude: locationData.lng,
        streetAddress: nominatimData.address?.road || nominatimData.address?.street,
        neighborhood: nominatimData.address?.suburb || nominatimData.address?.neighborhood,
        city: nominatimData.address?.city || nominatimData.address?.town,
        state: nominatimData.address?.state || nominatimData.address?.province,
        country: nominatimData.address?.country,
        postalCode: nominatimData.address?.postcode,
      }
    });

    return newLocation;
  } catch (error) {
    console.error('Error handling location:', error);
    throw error;
  }
}

function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[^\w\s,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getNonLocationQuery(categoryIds?: string[] | null, subcategoryIds?: string[] | null) {
  return {
    OR: [
      { serviceLocation: 'ONLINE' },
      { serviceLocation: 'HYBRID' }
    ],
    ...(categoryIds && categoryIds.length > 0 && {
      tags: {
        some: {
          subcategory: {
            category: {
              id: { in: categoryIds }
            },
            ...(subcategoryIds && subcategoryIds.length > 0 && {
              id: { in: subcategoryIds }
            })
          }
        }
      }
    })
  };
}
