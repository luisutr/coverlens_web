import { describe, expect, it } from 'vitest';
import { formatPageRange } from '../src/utils/pagination';

describe('formatPageRange', () => {
  it('formats first page', () => {
    expect(formatPageRange(1, 53668, 48, 'en-US')).toBe('1–48');
  });

  it('formats last partial page', () => {
    expect(formatPageRange(1119, 53668, 48, 'en-US')).toBe('53,665–53,668');
  });

  it('returns 0 when empty', () => {
    expect(formatPageRange(1, 0, 48, 'en-US')).toBe('0');
  });
});
