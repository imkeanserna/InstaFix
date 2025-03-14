import { PostMedia } from "@repo/types";

type UploadFilesResponse = {
  success: boolean;
  data: {
    files: PostMedia[];
  };
  error?: string;
}

export async function uploadFiles(files: File[]) {
  try {
    if (!files.length) {
      throw new Error('No files provided');
    }

    const formData = new FormData();
    files.forEach((file: File) => {
      formData.append('files', file);
    });

    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/uploadFiles`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed uploading files');
    }

    const result: UploadFilesResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error("Failed to create post");
    }
    return result.data;
  } catch (error) {
    throw new Error('Something went wrong uploading files');
  }
}

// Function to convert File to base64 for sending
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
