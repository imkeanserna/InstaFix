
import { Location, User } from "@prisma/client/edge";
import { IAddUser } from "@repo/types";

type ApiResponse = {
  success: boolean;
  data: User & {
    location: Location | null;
  };
  error?: string;
};

export const updateUser = async (data: IAddUser) => {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/user`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to update user");
    }
    return result.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
    throw new Error(errorMessage);
  }
}
