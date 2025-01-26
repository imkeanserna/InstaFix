import { PricingType, ServicesIncluded } from "@prisma/client/edge";
import { NextRequest } from "next/server";
import { FilterOptions } from "@repo/types";

export const runtime = "edge";

export function parseLocationParams(request: NextRequest): FilterOptions['location'] | null {
  const latitude = request.nextUrl.searchParams.get('latitude');
  const longitude = request.nextUrl.searchParams.get('longitude');
  const radiusInKm = request.nextUrl.searchParams.get('radius');

  if (!latitude && !longitude) {
    return null;
  }

  if (!latitude || !longitude) {
    throw new Error('Both latitude and longitude are required for location-based search');
  }

  const parsedLat = validateNumericParam(latitude, 0);
  const parsedLng = validateNumericParam(longitude, 0);
  const parsedRadius = validateNumericParam(radiusInKm, 10);

  // Validate coordinates
  if (parsedLat < -90 || parsedLat > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees');
  }
  if (parsedLng < -180 || parsedLng > 180) {
    throw new Error('Longitude must be between -180 and 180 degrees');
  }
  if (parsedRadius <= 0 || parsedRadius > 500) {
    throw new Error('Radius must be between 0 and 500 kilometers');
  }

  return {
    latitude: parsedLat,
    longitude: parsedLng,
    radiusInKm: parsedRadius
  };
}

export function validateNumericParam(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

export function parsePriceParams(request: NextRequest) {
  const minPrice = request.nextUrl.searchParams.get('minPrice');
  const maxPrice = request.nextUrl.searchParams.get('maxPrice');
  const priceType = validateEnumParam(
    request.nextUrl.searchParams.get('priceType'),
    PricingType
  ) as PricingType | null;

  if (!minPrice && !maxPrice && !priceType) {
    return null;
  }

  const parsedMin = minPrice ? validateNumericParam(minPrice, 0) : undefined;
  const parsedMax = maxPrice ? validateNumericParam(maxPrice, 0) : undefined;

  // Validate price range
  if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
    throw new Error('Minimum price cannot be greater than maximum price');
  }

  if (parsedMin !== undefined && parsedMin < 0) {
    throw new Error('Minimum price cannot be negative');
  }

  return {
    min: parsedMin,
    max: parsedMax,
    type: priceType || undefined
  };
}

export function parseServicesIncluded(services: string | null): ServicesIncluded[] | undefined {
  if (!services) return undefined;

  const parsed = services
    .split(',')
    .filter(Boolean)
    .map(service => service.trim().substring(0, 100))
    .filter(service => service.length > 0) as ServicesIncluded[];

  return parsed.length > 0 ? parsed : undefined;
}

// Validate the take parameter for cursor pagination
export function parseAndValidateTake(takeStr: string): number {
  const take = parseInt(takeStr);
  if (isNaN(take) || take < 1) {
    throw new Error('Take parameter must be a positive number');
  }
  if (take > 100) {
    throw new Error('Take parameter must not exceed 100');
  }
  return take;
}

// Query builder
export const buildBaseConditions = (options: FilterOptions) => {
  const {
    price,
    engagementType,
    minRating,
    targetAudience,
    servicesIncluded,
    categoryIds,
    subcategoryIds
  } = options;

  return {
    ...(price?.type && { pricingType: price.type }),
    ...(price?.min !== undefined || price?.max !== undefined) && {
      OR: [
        {
          AND: [
            { pricingType: 'HOURLY' },
            { hourlyRate: { gte: price?.min, lte: price?.max } }
          ]
        },
        {
          AND: [
            { pricingType: 'FIXED_PRICE' },
            { fixedPrice: { gte: price?.min, lte: price?.max } }
          ]
        }
      ]
    },
    ...(engagementType && {
      serviceEngagement: { some: { engagementType } }
    }),
    ...(minRating && {
      averageRating: { gte: minRating }
    }),
    ...(targetAudience && { targetAudience }),
    ...(servicesIncluded?.length && {
      servicesIncluded: { hasEvery: servicesIncluded }
    }),
    ...(categoryIds || subcategoryIds) && {
      tags: {
        some: {
          ...(categoryIds && {
            subcategory: {
              category: { id: { in: categoryIds } }
            }
          }),
          ...(subcategoryIds && {
            subcategoryId: { in: subcategoryIds }
          })
        }
      }
    }
  };
};

export const buildSearchQuery = (searchTerms: string[]) => ({
  OR: [
    {
      OR: searchTerms?.map(term => ({
        title: { contains: term, mode: 'insensitive' }
      }))
    },
    {
      OR: searchTerms?.map(term => ({
        description: { contains: term, mode: 'insensitive' }
      }))
    },
    { skills: { hasSome: searchTerms } },
    {
      tags: {
        some: {
          OR: searchTerms?.map(term => ({
            OR: [
              {
                subcategory: {
                  name: { contains: term, mode: 'insensitive' }
                }
              },
              {
                subcategory: {
                  category: {
                    name: { contains: term, mode: 'insensitive' }
                  }
                }
              }
            ]
          }))
        }
      }
    }
  ]
});

export function validateEnumParam<T extends string>(value: string | null, enumObj: Record<string, string>, defaultValue?: T): T | undefined {
  if (!value) return defaultValue;
  if (Object.values(enumObj).includes(value)) {
    return value as T;
  }
  throw new Error(`Invalid enum value. Allowed values: ${Object.values(enumObj).join(', ')}`);
}
