"use client"

type Options = {
  x?: number
  y?: number
  size?: number
  gap?: number
  color?: string
}

function drawChevron(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const mid = y + h / 2
  const notch = w * 0.35

  ctx.beginPath()
  ctx.moveTo(x, y)        // top-left
  ctx.lineTo(x + w - (w * 0.4), y)      // top-left-2
  ctx.lineTo(x + w, mid)      // tip
  ctx.lineTo(x + w - (w * 0.4), y + h)      // bottom-left-2
  ctx.lineTo(x, y + h)    // bottom-left
  ctx.lineTo(x + notch, mid)      // notch
  ctx.closePath()
  ctx.fill()
}

export const tripleArrow = (ctx: CanvasRenderingContext2D, options: Options = {}) => {
  const { size = 48, gap = 6, color = '#fff' } = options

  const w = size
  const h = size
  const totalWidth = w * 3 + gap * 2
  const x = options.x ?? (ctx.canvas.width - totalWidth) / 2
  const y = options.y ?? (ctx.canvas.height - h) / 2

  ctx.fillStyle = color

  for (let i = 0; i < 3; i++) {
    drawChevron(ctx, x + i * (w + gap), y, w, h)
  }
}
