export function formatMoneyEur(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatLanguages(value: string[] | string | null | undefined): string | null {
  if (value == null) return null;
  if (Array.isArray(value)) {
    const list = value.filter(Boolean);
    return list.length ? list.join(', ') : null;
  }
  const trimmed = String(value).trim();
  return trimmed || null;
}
