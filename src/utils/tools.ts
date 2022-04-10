import { useEffect, useRef } from "react";

export function debounce<
  T extends unknown[]
>(
  func: (...args: T) => void,
  delay: number,
):
  (...args: T) => void
{
  let timer: NodeJS.Timeout | null = null;
  return (...args: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.call(null, ...args);
    }, delay);
  };
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}