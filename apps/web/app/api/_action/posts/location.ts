import { prisma } from '@/server/index';
import { PostLocation } from '@repo/types';

export const runtime = 'edge'

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
