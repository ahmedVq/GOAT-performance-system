import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, duration = 900, decimals = 0) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef<number>()
  const startRef = useRef<number>()

  useEffect(() => {
    if (target === 0) { setDisplay(0); return }
    startRef.current = undefined

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(parseFloat((target * eased).toFixed(decimals)))
      if (progress < 1) frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [target, duration, decimals])

  return display
}
