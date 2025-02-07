export type TypedBooking = {
  id: string;
  date: Date;
  status: string;
  client: {
    id: string;
  };
};
