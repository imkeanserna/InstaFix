import { Category, Subcategory } from "@prisma/client/edge";

type GetCategoriesResponse = {
  success: boolean;
  data: {
    categories: Category[];
  };
  error?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  imageSrc: string | null;
  subcategories: Subcategory[] | null;
}

export async function getCategories(): Promise<CategoryResponse[]> {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const result: GetCategoriesResponse = await response.json();
    if (!result.success) {
      throw new Error("Failed to create post");
    }
    return result.data.categories as CategoryResponse[];
  } catch (error) {
    return [];
  }
}
