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

export const truncateBefore = (str: string, pattern: string) =>
  str.slice(str.indexOf(pattern) + pattern.length)

export const truncateAfter = (str: string, pattern: string) =>
  str.slice(0, str.indexOf(pattern))

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

export const chooseEnvEndpoint = (): any => {
  if (process.env.REACT_APP_ENVIRONMENT === 'dev') {
    fetch('/.netlify/functions/metro-updates').then((res) => res.json())
  } else if (process.env.REACT_APP_ENVIRONMENT === 'prod') {
    if (Math.random() > 0.2) {
      fetch(process.env.REACT_APP_EXT_BUS_API!).then((res) => res.json())
    } else {
      fetch(process.env.REACT_APP_INT_BUS_API!).then((res) => res.json())
    }
  }
}
