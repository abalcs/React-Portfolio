import { renderHook } from '@testing-library/react';
import { useCountUp } from '../useCountUp';

describe('useCountUp', () => {
  it('should start at the start value when disabled', () => {
    const { result } = renderHook(() =>
      useCountUp({ end: 100, start: 0, enabled: false })
    );
    expect(result.current).toBe(0);
  });

  it('should return custom start value when disabled', () => {
    const { result } = renderHook(() =>
      useCountUp({ end: 100, start: 10, enabled: false })
    );
    expect(result.current).toBe(10);
  });

  it('should accept custom start value', () => {
    const { result } = renderHook(() =>
      useCountUp({ end: 100, start: 50, enabled: false })
    );
    expect(result.current).toBe(50);
  });

  it('should default start to 0', () => {
    const { result } = renderHook(() =>
      useCountUp({ end: 100, enabled: false })
    );
    expect(result.current).toBe(0);
  });

  it('should handle decimal values when disabled', () => {
    const { result } = renderHook(() =>
      useCountUp({ end: 10.5, decimals: 1, enabled: false })
    );
    expect(result.current).toBe(0);
  });

  it('should reset to start when disabled after being enabled', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useCountUp({ end: 100, start: 0, enabled }),
      { initialProps: { enabled: true } }
    );

    // Disable the counter
    rerender({ enabled: false });
    expect(result.current).toBe(0);
  });

  it('should handle different end values', () => {
    const { result: result1 } = renderHook(() =>
      useCountUp({ end: 50, enabled: false })
    );
    expect(result1.current).toBe(0);

    const { result: result2 } = renderHook(() =>
      useCountUp({ end: 200, enabled: false })
    );
    expect(result2.current).toBe(0);
  });
});
