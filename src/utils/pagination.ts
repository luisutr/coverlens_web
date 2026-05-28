export function formatPageRange(
  page: number,
  total: number,
  pageSize: number,
  locale = 'es-ES',
): string {
  if (total === 0) return '0';
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return `${from.toLocaleString(locale)}–${to.toLocaleString(locale)}`;
}
