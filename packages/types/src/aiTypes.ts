export interface IFetchPredictionResponse {
  type: string;
  time: Date;
  data: string[];
  endpoint: string;
  fn_index: number;
}
