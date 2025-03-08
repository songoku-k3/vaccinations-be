import { Vaccination } from '@prisma/client';

export interface VaccinationPaginationResponseType {
  data: Vaccination[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
