'use client'
import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'

export type DBoardHandle = {
  toDataURL: () => string
}

type Props = {
  width: number
  height: number
  previewWidth?: number
  drawAction: (ctx: CanvasRenderingContext2D) => void
  className?: string
}

const DBoard = forwardRef<DBoardHandle, Props>(function DBoard({ width, height, previewWidth, drawAction, className }, forwardedRef) {
  const ref = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(forwardedRef, () => ({
    toDataURL: () => ref.current?.toDataURL('image/png') ?? '',
  }))

  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    drawAction(ctx)
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
})

export default DBoard
