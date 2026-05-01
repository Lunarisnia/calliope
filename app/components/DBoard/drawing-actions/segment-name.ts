"use client"

type Options = {
  lines: string[]
  x: number
  y: number
  font?: string
  color?: string
  bgColor?: string
  padX?: number
  padY?: number
  lineHeight?: number
  align?: 'left' | 'center' | 'right'
}

export const segmentName = (ctx: CanvasRenderingContext2D, options: Options) => {
  const {
    lines,
    x,
    y,
    font = '40px "Horizon"',
    color = '#ffffff',
    bgColor = '#111111',
    padX = 16,
    padY = 10,
    align = 'left',
  } = options

  ctx.save()
  ctx.font = font
  ctx.textAlign = align
  ctx.textBaseline = 'top'

  const metrics = lines.map(l => ctx.measureText(l))
  const lineH = options.lineHeight ?? (metrics[0].actualBoundingBoxDescent - metrics[0].actualBoundingBoxAscent + padY * 2)
  const rowH = lineH + padY * 2

  lines.forEach((line, i) => {
    const w = metrics[i].width
    const lx = align === 'center' ? x - w / 2 - padX
      : align === 'right' ? x - w - padX
      : x - padX
    const ly = y + i * rowH

    ctx.fillStyle = bgColor
    ctx.fillRect(lx, ly - padY, w + padX * 2, rowH)

    ctx.fillStyle = color
    ctx.fillText(line, x, ly)
  })

  ctx.restore()
}
