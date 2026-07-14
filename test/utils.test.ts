import { describe, it, expect, vi } from 'vitest';

import { compose } from '../src/utils';

describe('Utils', () => {
  describe('compose', () => {
    it('should compose g after f', () => {
      const f1 = vi.fn().mockReturnValue(24);
      const f2 = vi.fn().mockReturnValue(42);
      const c = compose(f2, f1);

      expect(c(1)).toBe(42);
      expect(f1).toHaveBeenCalledWith(1);
      expect(f2).toHaveBeenCalledWith(24);
      expect(f1.mock.invocationCallOrder[0]).toBeLessThan(
        f2.mock.invocationCallOrder[0],
      );
    });
  });
});
