import { useState, CSSProperties } from 'react'

type Ripple = { id: number; x: number; y: number; size: number }

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const trigger = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const id = Date.now()
    setRipples(prev => [...prev, { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
  }

  const nodes = ripples.map(r => (
    <span
      key={r.id}
      className="pointer-events-none absolute rounded-full bg-black/20"
      style={{ left: r.x, top: r.y, width: r.size, height: r.size, animation: 'ripple 0.6s linear forwards' } as CSSProperties}
    />
  ))

  return { trigger, nodes }
}
