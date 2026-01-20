type PaginationInput = {
  page?: unknown;
  pageSize?: unknown;
};

export const getPagination = (
  input: PaginationInput,
  defaults: { pageSize?: number; maxPageSize?: number } = {},
) => {
  const rawPage = Number(input.page ?? "1");
  const rawPageSize = Number(input.pageSize ?? defaults.pageSize ?? "20");
  const maxPageSize = defaults.maxPageSize ?? 100;

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0 && rawPageSize <= maxPageSize
      ? rawPageSize
      : defaults.pageSize ?? 20;

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};

export const buildPageMeta = (page: number, pageSize: number, total: number) => ({
  page,
  pageSize,
  total,
  hasMore: page * pageSize < total,
});
