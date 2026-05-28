/** Ancho mínimo de tarjeta (px) — alineado con app móvil ~145px */
export const CARD_MIN_WIDTH = 130;

/** Máximo de columnas en escritorio */
export const MAX_COLUMNS = 8;

/** Mínimo de columnas en móvil */
export const MIN_COLUMNS = 2;

/** Ratio portada PAL (ancho / alto) */
export const COVER_ASPECT = 90 / 128;

/** Padding vertical extra bajo la portada (título + plataforma + valor) */
export const CARD_TEXT_BLOCK = 72;

export function computeColumns(viewportWidth: number): number {
  if (viewportWidth <= 0) return MIN_COLUMNS;
  return Math.max(MIN_COLUMNS, Math.min(MAX_COLUMNS, Math.floor(viewportWidth / CARD_MIN_WIDTH)));
}

export function computeRowHeight(viewportWidth: number, columns: number, gap = 16): number {
  const horizontalPadding = 32;
  const cellWidth =
    (viewportWidth - horizontalPadding - gap * (columns - 1)) / Math.max(columns, 1);
  const coverHeight = cellWidth / COVER_ASPECT;
  return Math.ceil(coverHeight + CARD_TEXT_BLOCK + gap);
}
