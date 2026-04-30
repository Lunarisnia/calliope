'use client'
import { useRef, useEffect } from 'react'

type Props = {
  width: number
  height: number
  previewWidth?: number
  drawAction: (ctx: CanvasRenderingContext2D) => void
  className?: string
}

export default function DBoard({ width, height, previewWidth, drawAction, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    drawAction(ctx)
    return () => { ref.current = null };
  }, [drawAction])

  const displayWidth = previewWidth ?? width
  const displayHeight = previewWidth ? Math.round((previewWidth / width) * height) : height

  return (
    <div
      className={`border border-gray-300 overflow-hidden mx-2 shrink-0`}
      style={{ width: displayWidth, height: displayHeight }}
    >
      <canvas
        ref={ref}
        width={width}
        height={height}
        className={className}
        style={{
          width: displayWidth,
          height: displayHeight,
        }}
      />
    </div>
  )
}
