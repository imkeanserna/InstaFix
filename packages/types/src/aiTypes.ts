export interface IFetchPredictionResponse {
  type: string;
  time: Date;
  data: string[];
  endpoint: string;
  fn_index: number;
}

export interface IChatResponse {
  tag: string[] | null;
  ratings: number | null;
  location: string | null;
  price: number;
  message: string;
  shouldQuery: boolean;
  queryType: QueryType | null;
}

export enum QueryType {
  PROVIDE_SOLUTION = 'PROVIDE_SOLUTION',
  FIND_PROFESSIONALS = 'FIND_PROFESSIONALS',
}

export interface IHuggingFaceResponse {
  generated_text: string;
}
