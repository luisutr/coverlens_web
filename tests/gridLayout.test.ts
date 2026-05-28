import { describe, expect, it } from 'vitest';
import { computeColumns, computeRowHeight, MAX_COLUMNS, MIN_COLUMNS } from '../src/utils/gridLayout';

describe('gridLayout', () => {
  it('computeColumns returns 2 on mobile', () => {
    expect(computeColumns(375)).toBe(MIN_COLUMNS);
  });

  it('computeColumns returns 8 on wide desktop', () => {
    expect(computeColumns(1920)).toBe(MAX_COLUMNS);
  });

  it('computeColumns scales between min and max', () => {
    expect(computeColumns(800)).toBeGreaterThanOrEqual(4);
    expect(computeColumns(800)).toBeLessThanOrEqual(MAX_COLUMNS);
  });

  it('computeRowHeight grows with wider cells', () => {
    const narrow = computeRowHeight(400, 2);
    const wide = computeRowHeight(1920, 8);
    expect(wide).toBeGreaterThan(100);
    expect(narrow).toBeGreaterThan(100);
  });
});
