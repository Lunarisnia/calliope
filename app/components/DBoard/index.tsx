import { useRef, useEffect } from 'react'

type Props = {
  width: number
  height: number
  draw: (ctx: CanvasRenderingContext2D) => void
  className?: string
}

export default function DBoard({ width, height, draw, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    draw(ctx)
  }, [draw])

  return <canvas ref={ref} width={width} height={height} className={className} />
}
