export interface IAddUser {
  email?: string;
  name?: string;
  password?: string;
  image?: string;
  location?: {
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
}
