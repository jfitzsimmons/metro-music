import { useEffect, useRef } from 'react'

export function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  delay: number,
): (...args: T) => void {
  let timer: NodeJS.Timeout | null = null
  return (...args: T) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.call(null, ...args)
    }, delay)
  }
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

export const truncateBefore = function (str: string, pattern: string) {
  return str.slice(str.indexOf(pattern) + pattern.length)
}
export const truncateAfter = function (str: string, pattern: string) {
  return str.slice(0, str.indexOf(pattern))
}

export function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight + 100 ||
        document.documentElement.clientHeight + 100) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
