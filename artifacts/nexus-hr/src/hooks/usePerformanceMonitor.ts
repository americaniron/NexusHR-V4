import { useEffect, useRef, useCallback } from "react";

interface PerformanceMetrics {
  renderCount: number;
  lastRenderDuration: number;
  averageRenderDuration: number;
  slowRenders: number;
}

const SLOW_RENDER_THRESHOLD_MS = 16;

export function usePerformanceMonitor(componentName: string, enabled = false) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderDuration: 0,
    averageRenderDuration: 0,
    slowRenders: 0,
  });
  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderStartRef.current = performance.now();

    return () => {
      const duration = performance.now() - renderStartRef.current;
      const metrics = metricsRef.current;
      metrics.renderCount++;
      metrics.lastRenderDuration = duration;
      metrics.averageRenderDuration =
        (metrics.averageRenderDuration * (metrics.renderCount - 1) + duration) / metrics.renderCount;

      if (duration > SLOW_RENDER_THRESHOLD_MS) {
        metrics.slowRenders++;
        if (import.meta.env.DEV) {
          console.warn(`[Perf] Slow render in ${componentName}: ${duration.toFixed(2)}ms`);
        }
      }
    };
  });

  const getMetrics = useCallback(() => ({ ...metricsRef.current }), []);

  return { getMetrics };
}

export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay],
  ) as T;
}

export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const elapsed = now - lastCallRef.current;

      if (elapsed >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - elapsed);
      }
    },
    [callback, delay],
  ) as T;
}
