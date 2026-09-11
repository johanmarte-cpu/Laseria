export type DisplayAppointment = {
  id: string;
  bookingNumber: string;
  date: string; // ISO date
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  totalDuration: number;
  notes: string;
  professional: { id: string; firstName: string; lastName: string; photoUrl: string };
  services: { id: string; name: string }[];
};
