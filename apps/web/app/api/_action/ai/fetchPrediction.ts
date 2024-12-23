import { Client } from "@gradio/client";
import { IHuggingFaceResponse } from "@repo/types";

const HUGGING_FACE_URL = "https://api-inference.huggingface.co/models/microsoft/git-base";

class GradioClientSingleton {
  private static instance: Client | null = null;
  private static CLIENT_URL = "kenkurosaki/Very-Fast-Chatbot";

  private constructor() { }

  public static async getInstance(): Promise<Client> {
    if (!GradioClientSingleton.instance) {
      const hfToken: any = process.env.HUGGING_FACE_API_KEY;

      if (!hfToken) {
        throw new Error("HUGGING_FACE_API_KEY is not defined");
      }

      GradioClientSingleton.instance = await Client.connect(
        GradioClientSingleton.CLIENT_URL,
        { hf_token: hfToken }
      );
    }
    return GradioClientSingleton.instance;
  }
}

export const fetchPrediction = async (query: string) => {
  try {
    const client = await GradioClientSingleton.getInstance();
    const result = await client.predict("/predict", { Query: query });
    return result;
  } catch (error) {
    throw error;
  }
};

export async function analyzeImageWithHuggingFace(imageData: Blob): Promise<IHuggingFaceResponse[]> {
  const response = await fetch(HUGGING_FACE_URL, {
    headers: {
      Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: imageData,
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
