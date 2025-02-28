import { Tag } from '@prisma/client';

export class TagDto {
  search?: string;
  items_per_page?: number;
  page?: number;
}

export interface TagPaginationResponseType {
  data: Tag[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
