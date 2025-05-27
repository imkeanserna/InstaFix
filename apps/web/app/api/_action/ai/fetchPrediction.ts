import { Client } from "@gradio/client";
import { IFetchPredictionResponse, IHuggingFaceResponse } from "@repo/types";
import Groq from "groq-sdk";

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
      endpoint: "/caption"
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

  public static async predict(clientType: string, data: {
    image: Blob | File | Buffer;
    text: string;
  }): Promise<IFetchPredictionResponse> {
    try {
      const client = await this.getInstance(clientType);
      const config = this.CLIENT_CONFIGS[clientType];
      const predict = await client.predict(config.endpoint, data);
      return {
        type: predict.type,
        time: predict.time,
        data: predict.data as string[],
        endpoint: predict.endpoint,
        fn_index: predict.fn_index
      };
    } catch (error) {
      throw error;
    }
  }
}

class GroqClientSingleton {
  private static instance: GroqClientSingleton | null = null;
  private groqClient: Groq;

  private constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not defined in environment variables');
    }
    this.groqClient = new Groq({ apiKey });
  }

  public static getInstance(): GroqClientSingleton {
    if (!GroqClientSingleton.instance) {
      GroqClientSingleton.instance = new GroqClientSingleton();
    }
    return GroqClientSingleton.instance;
  }

  public async chat(query: string) {
    try {
      const response = await this.groqClient.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an assistant for InstaFix, a platform that connects users with trusted freelance professionals in various categories like plumbing, mechanics, computer repair, and health.",
          },
          {
            role: "user",
            content: query,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 1024,
        top_p: 1,
        stop: null,
        stream: false
      });
      return {
        data: [response.choices[0].message.content]
      };
    } catch (error) {
      throw error;
    }
  }
}

export const fetchChatGroq = async (query: string) => {
  try {
    const groqClient = GroqClientSingleton.getInstance();
    return await groqClient.chat(query);
  } catch (error) {
    throw error;
  }
};

export async function analyzeImageWithHuggingFace(imageData: Blob): Promise<IHuggingFaceResponse> {
  try {
    const response = await GradioClientSingleton.predict('imageAnalysis',
      {
        image: imageData,
        text: "A picture of",
      }
    ) as IFetchPredictionResponse;
    return {
      generated_text: response.data[0]
    };
  } catch (error) {
    throw error;
  }
}
