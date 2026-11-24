import { useEffect, useRef, useState } from 'react'

/** Întoarce `value`, dar actualizat cel mult o dată la `ms` milisecunde (cu ultima valoare garantată la final). */
export function useThrottled<T>(value: T, ms = 80): T {
  const [v, setV] = useState(value)
  const last = useRef(0)
  useEffect(() => {
    const wait = Math.max(0, last.current + ms - performance.now())
    const id = setTimeout(() => {
      last.current = performance.now()
      setV(value)
    }, wait)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}
