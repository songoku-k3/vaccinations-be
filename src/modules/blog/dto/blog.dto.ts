import { Blog } from '@prisma/client';

export class BlogDto {
  search?: string;
  items_per_page?: number;
  page?: number;
}

export interface BlogPaginationResponseType {
  data: Blog[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
