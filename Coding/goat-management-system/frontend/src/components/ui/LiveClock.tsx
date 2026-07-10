import { useEffect, useState } from 'react'

export function LiveClock() {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = time.getHours().toString().padStart(2, '0')
  const mm = time.getMinutes().toString().padStart(2, '0')
  const ss = time.getSeconds().toString().padStart(2, '0')
  const date = time.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-steel-gray/60 select-none">
      <span>{date}</span>
      <span className="text-steel-gray/30">·</span>
      <span className="font-mono text-steel-gray/80">
        {hh}<span className="clock-colon">:</span>{mm}<span className="clock-colon">:</span>{ss}
      </span>
    </div>
  )
}
