import type { DisplayAppointment } from "@/components/dashboard/types";

type PrismaAppointmentWithRelations = {
  id: string;
  bookingNumber: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  totalDuration: number;
  notes: string;
  professional: { id: string; firstName: string; lastName: string; photoUrl: string };
  services: { service: { id: string; name: string } }[];
};

export function toDisplayAppointment(appt: PrismaAppointmentWithRelations): DisplayAppointment {
  return {
    id: appt.id,
    bookingNumber: appt.bookingNumber,
    date: appt.date.toISOString(),
    startTime: appt.startTime,
    endTime: appt.endTime,
    status: appt.status,
    totalPrice: appt.totalPrice,
    totalDuration: appt.totalDuration,
    notes: appt.notes,
    professional: appt.professional,
    services: appt.services.map((s) => s.service),
  };
}
