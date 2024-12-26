import { Client } from "@gradio/client";
import { IFetchPredictionResponse, IHuggingFaceResponse } from "@repo/types";

interface ClientConfig {
  url: string;
  endpoint: string;
}

class GradioClientSingleton {
  private static instances: Map<string, Client> = new Map();
  private static readonly CLIENT_CONFIGS: { [key: string]: ClientConfig } = {
    chatbot: {
      url: process.env.HUGGING_CHATBOT_URL as string,
      endpoint: "/predict"
    },
    imageAnalysis: {
      url: process.env.HUGGING_IMAGE_CLASSIFICATION_URL as string,
      endpoint: "/predict"
    }
  };

  private constructor() { }

  private static async createClient(clientType: string): Promise<Client> {
    const config = this.CLIENT_CONFIGS[clientType];
    if (!config) {
      throw new Error(`Unknown client type: ${clientType}`);
    }

    const hfToken: any = process.env.HUGGING_FACE_API_KEY;
    if (!hfToken) {
      throw new Error("HUGGING_FACE_API_KEY is not defined");
    }

    return await Client.connect(config.url, { hf_token: hfToken });
  }

  public static async getInstance(clientType: string): Promise<Client> {
    if (!this.instances.has(clientType)) {
      const client = await this.createClient(clientType);
      this.instances.set(clientType, client);
    }
    return this.instances.get(clientType)!;
  }

  public static async predict(clientType: string, data: any): Promise<any> {
    try {
      const client = await this.getInstance(clientType);
      const config = this.CLIENT_CONFIGS[clientType];
      return await client.predict(config.endpoint, data);
    } catch (error) {
      throw error;
    }
  }
}

export const fetchPrediction = async (query: string) => {
  try {
    return await GradioClientSingleton.predict('chatbot', { Query: query });
  } catch (error) {
    throw error;
  }
};

export async function analyzeImageWithHuggingFace(imageData: Blob): Promise<IHuggingFaceResponse> {
  try {
    const response = await GradioClientSingleton.predict('imageAnalysis', { param_0: imageData }) as IFetchPredictionResponse;
    const generatedText = response.data[0].match(/generated_text='([^']*)'/)![1];
    return {
      generated_text: generatedText
    };
  } catch (error) {
    throw error;
  }
}
