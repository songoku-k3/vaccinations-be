import { Appointment } from '@prisma/client';
import { PaginationResponse } from 'src/types/PaginationResponse';

export type AppointmentPaginationtype = PaginationResponse<Appointment>;
