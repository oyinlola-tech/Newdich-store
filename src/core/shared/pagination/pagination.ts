export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function buildPagination(pageValue: unknown, limitValue: unknown, maxLimit = 100): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number.parseInt(String(pageValue ?? '1'), 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(String(limitValue ?? '20'), 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export function toPaginated<T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}
