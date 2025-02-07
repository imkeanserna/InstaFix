import { Subcategory } from "@prisma/client/edge";

interface ObjectDetectionResponse {
  success: boolean;
  data: {
    detected: string;
    professions: string[];
    subCategories: Subcategory[] | null
  };
  error?: string;
}

export async function objectDetection(imageData: Blob) {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/object-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'image/jpeg' },
      body: imageData
    });

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: ObjectDetectionResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error occurred');
    }

    if (!result.data) {
      throw new Error("Try to clear the image and try again!");
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}
