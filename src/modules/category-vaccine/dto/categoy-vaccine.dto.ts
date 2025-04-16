import { CategoryVaccination } from '@prisma/client';
import { PaginationResponse } from 'src/types/PaginationResponse';

export type CategoryVaccinationPaginationResponse =
  PaginationResponse<CategoryVaccination>;
