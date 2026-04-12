/**
 * Extracts and validates page/limit query params.
 * Returns SQL-ready LIMIT and OFFSET values.
 *
 * Usage: const { limit, offset, page } = getPagination(req.query);
 */
export const getPagination = (query: Record<string, unknown>) => {
  const page = Math.max(1, parseInt(String(query.page || 1), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || 20), 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Builds the metadata object returned alongside paginated results.
 */
export const buildPaginationMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
