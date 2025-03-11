import { Booking } from '@prisma/client';
import { PaginationResponse } from 'src/types/PaginationResponse';

export type BookingPaginationtype = PaginationResponse<Booking>;
