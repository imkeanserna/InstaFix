export interface IFetchPredictionResponse {
  type: string;
  time: Date;
  data: string[];
  endpoint: string;
  fn_index: number;
}

export interface IChatGPTResponse {
  tag: string[];
  ratings: number;
  location: string;
  price: number;
  message: string;
}

export interface IHuggingFaceResponse {
  generated_text: string;
}
