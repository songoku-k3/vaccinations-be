import { Supplier } from '@prisma/client';
import { PaginationResponse } from 'src/types/PaginationResponse';

export type SupplierPaginationResponse = PaginationResponse<Supplier>;
