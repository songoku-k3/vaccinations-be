import { Appointment, User, Vaccination } from '@prisma/client';
import { PaginationResponse } from 'src/types/PaginationResponse';

export type AppointmentPaginationtype = PaginationResponse<Appointment>;

export type DailyAppointmentsResponse = {
  data: {
    date: string;
    total: number;
    appointments: (Appointment & {
      user: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
      vaccination: Pick<Vaccination, 'id' | 'vaccineName' | 'location'>;
    })[];
  };
};
