import { describe, expect, it } from 'vitest';
import { formatMoneyEur } from '../src/utils/format';

describe('formatMoneyEur', () => {
  it('formats EUR with es-ES locale', () => {
    const formatted = formatMoneyEur(47.95);
    expect(formatted).toMatch(/47,95/);
    expect(formatted).toMatch(/€/);
  });

  it('returns null for null/undefined', () => {
    expect(formatMoneyEur(null)).toBeNull();
    expect(formatMoneyEur(undefined)).toBeNull();
  });
});
