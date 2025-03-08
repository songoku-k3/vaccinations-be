import { Manufacturer } from '@prisma/client';
import { PaginationResponse } from 'src/types/PaginationResponse';

export type ManufacturerPaginationResponse = PaginationResponse<Manufacturer>;
