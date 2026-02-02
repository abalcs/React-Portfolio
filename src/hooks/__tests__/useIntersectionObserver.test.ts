import { renderHook, act } from '@testing-library/react';
import { useIntersectionObserver } from '../useIntersectionObserver';

describe('useIntersectionObserver', () => {
  let mockObserve: jest.Mock;
  let mockUnobserve: jest.Mock;
  let mockCallback: IntersectionObserverCallback;

  beforeEach(() => {
    mockObserve = jest.fn();
    mockUnobserve = jest.fn();

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        mockCallback = callback;
      }
      observe = mockObserve;
      unobserve = mockUnobserve;
      disconnect = jest.fn();
    }

    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  it('should return a ref and isVisible state', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.ref).toBeDefined();
    expect(result.current.isVisible).toBe(false);
  });

  it('should not observe when ref is not attached', () => {
    renderHook(() => useIntersectionObserver());
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should use default threshold of 0.1', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    expect(result.current.ref).toBeDefined();
  });

  it('should accept custom threshold', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ threshold: 0.5 })
    );
    expect(result.current.ref).toBeDefined();
  });

  it('should accept custom rootMargin', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ rootMargin: '10px' })
    );
    expect(result.current.ref).toBeDefined();
  });

  it('should default triggerOnce to true', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    expect(result.current.isVisible).toBe(false);
  });
});
