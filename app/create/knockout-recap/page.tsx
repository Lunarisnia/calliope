'use client'

import { useState, useCallback, useRef, forwardRef } from 'react'
import dynamic from 'next/dynamic'
import type { DBoardHandle } from '@/app/components/DBoard'
import { tripleArrow } from '@/app/components/DBoard/drawing-actions/triple-arrow'
import { segmentName } from '@/app/components/DBoard/drawing-actions/segment-name'
import { loadImg } from '@/app/utils/loadImg'
import { loadFonts } from '@/app/utils/loadFonts'
import { ACCENT, DARK } from '@/app/constants/colors'
import { Winner, WinnerList } from './components/WinnerList'

const RED = '#c03535';

const DBoard = dynamic(() => import('@/app/components/DBoard'), { ssr: false })

function placement(index: number) {
  const labels = ['1ST', '2ND', '3RD']
  return (labels[index] ?? `${index + 1}TH`) + ' PLACE'
}

function makeControllerDraw(
  bgImage: string,
  controllerImage: string,
  name: string,
  placementLabel: string,
  imgCache: Map<string, HTMLImageElement>,
  fontReady: { current: Promise<void> | null },
  showArrow: boolean,
) {
  return (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    const getCached = (src: string, crossOrigin = false) => {
      let img = imgCache.get(src)
      if (!img) {
        img = new Image()
        if (crossOrigin) img.crossOrigin = 'anonymous'
        img.src = src
        imgCache.set(src, img)
      }
      return img
    }

    const bg = getCached(bgImage, true)
    const logo = getCached('/Box_Logo_Black.png')
    const controller = getCached(controllerImage)

    if (!fontReady.current) {
      fontReady.current = loadFonts()
    }

    Promise.all([loadImg(bg), loadImg(controller), fontReady.current]).then(([loadedBg, loadedController]) => {
      // Blurred background — overdraw edges to hide blur fringe
      const bleed = 40
      ctx.filter = 'blur(20px)'
      ctx.drawImage(loadedBg, -bleed, -bleed, width + bleed * 2, height + bleed * 2)
      ctx.filter = 'none'

      // Controller image centered
      const maxW = width * 0.8
      const maxH = height * 0.6
      const scale = Math.min(maxW / loadedController.naturalWidth, maxH / loadedController.naturalHeight)
      const cw = loadedController.naturalWidth * scale
      const ch = loadedController.naturalHeight * scale
      const cx = (width - cw) / 2
      let cy = (height - ch) / 2
      cy -= cy * 0.4
      ctx.drawImage(loadedController, cx, cy, cw, ch)

      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 8
      ctx.strokeRect(cx, cy, cw, ch)

      // "Via +CREW Exclusive" — top right of image, scaled to fit controller width
      let viaSize = 16
      ctx.font = `${viaSize}px "Horizon"`
      while (ctx.measureText('Via +CREW Exclusive').width > cw && viaSize > 1) {
        viaSize--
        ctx.font = `${viaSize}px "Horizon"`
      }
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText('Via +CREW Exclusive', cx + cw, cy - 16)

      // Winner name block
      const blockX = cx - 40
      let labelSize = 80
      let nameSize = 100
      const blockPadX = 32
      const blockPadY = 24
      const lineGap = 8
      const maxTextW = width * 0.8 - blockPadX * 2

      ctx.font = `${nameSize}px "Horizon"`
      while (ctx.measureText(name.toUpperCase() || ' ').width > maxTextW && nameSize > 20) {
        nameSize--
        ctx.font = `${nameSize}px "Horizon"`
      }

      ctx.font = `${labelSize}px "Horizon"`
      while (ctx.measureText(placementLabel.toUpperCase()).width > maxTextW && labelSize > 20) {
        labelSize--
        ctx.font = `${labelSize}px "Horizon"`
      }

      ctx.font = `${labelSize}px "Horizon"`
      const labelW = ctx.measureText(placementLabel.toUpperCase()).width
      ctx.font = `${nameSize}px "Horizon"`
      const nameW = ctx.measureText(name.toUpperCase() || ' ').width

      const blockW = Math.min(Math.max(labelW, nameW) + blockPadX * 2, width * 0.8)
      const blockH = labelSize + lineGap + nameSize + blockPadY * 2
      const blockY = cy + ch + 20

      const shadow = 14
      ctx.fillStyle = RED
      ctx.fillRect(blockX + shadow, blockY + shadow, blockW, blockH)
      ctx.fillStyle = DARK
      ctx.fillRect(blockX, blockY, blockW, blockH)

      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      ctx.font = `${labelSize}px "Horizon"`
      ctx.fillStyle = RED
      ctx.fillText(placementLabel.toUpperCase(), blockX + blockPadX, blockY + blockPadY)

      ctx.font = `${nameSize}px "Horizon"`
      ctx.fillStyle = '#ffffff'
      ctx.fillText(name.toUpperCase() || ' ', blockX + blockPadX, blockY + blockPadY + labelSize + lineGap)

      // Logo (unblurred)
      const drawLogo = () => ctx.drawImage(logo, 70, 60, logo.naturalWidth * 0.3, logo.naturalHeight * 0.3)
      if (logo.complete) drawLogo()
      else logo.addEventListener('load', drawLogo, { once: true })

      segmentName(ctx, {
        lines: ['KNOCK OUT', 'REPORTS'],
        x: 160,
        y: height - 180,
        font: '40px "Horizon"',
        color: RED,
        bgColor: DARK,
        padX: 16,
        padY: 0.4,
        lineHeight: 38,
      })

      // Triple arrow (unblurred)
      if (showArrow) tripleArrow(ctx, { color: RED, gap: 4, size: 42, x: width - 320, y: height - 160 })
    })
  }
}

function makeDraw(
  bgImage: string,
  title: string,
  imgCache: Map<string, HTMLImageElement>,
  fontReady: { current: Promise<void> | null }
) {
  return (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    const getCached = (src: string, crossOrigin = false) => {
      let img = imgCache.get(src)
      if (!img) {
        img = new Image()
        if (crossOrigin) img.crossOrigin = 'anonymous'
        img.src = src
        imgCache.set(src, img)
      }
      return img
    }

    const bg = getCached(bgImage, true)
    const logo = getCached('/Box_Logo_Black.png')

    if (!fontReady.current) {
      fontReady.current = loadFonts()
    }

    const render = (loadedBg: HTMLImageElement) => {
      ctx.drawImage(loadedBg, 0, 0, width, height)

      const drawLogo = () => ctx.drawImage(logo, 70, 60, logo.naturalWidth * 0.3, logo.naturalHeight * 0.3)
      if (logo.complete) drawLogo()
      else logo.addEventListener('load', drawLogo, { once: true })

      const lines = title.split('\n').map(l => l.trim().toUpperCase()).filter(Boolean)
      if (lines.length === 0) return

      // Auto-size font to fit within ~55% canvas width
      const maxLineW = width * 0.55
      let fontSize = 160
      ctx.font = `${fontSize}px "Horizon"`
      const longestLine = lines.reduce((a, b) =>
        ctx.measureText(a).width >= ctx.measureText(b).width ? a : b
      )
      while (ctx.measureText(longestLine).width > maxLineW && fontSize > 40) {
        fontSize--
        ctx.font = `${fontSize}px "Horizon"`
      }

      const lineHeight = fontSize * 1.5
      const recapSize = Math.round(fontSize * 1.35)
      const padX = 80
      const padY = 60

      ctx.font = `${fontSize}px "Horizon"`
      const lineWidths = lines.map(l => ctx.measureText(l).width)
      const titleBlockH = lines.length * lineHeight

      ctx.font = `${recapSize}px "Horizon"`
      const recapW = ctx.measureText('RECAP').width

      const contentH = titleBlockH + recapSize * 1.5

      const blockH = contentH + padY * 2
      const cx = width / 2
      const blockY = (height - blockH) / 2

      const shadow = 14  // red offset shift

      // RECAP rect dimensions (needed inside makeOffscreen)
      const recapY = blockY + padY + lines.length * lineHeight
      const recapPadX = padX
      const recapPadY = padY / 2
      const recapRx = cx - recapW / 2 - recapPadX
      const recapRy = recapY - recapPadY
      const recapRw = recapW + recapPadX * 2
      const recapRh = recapSize * 1.5 + recapPadY

      const makeOffscreen = (color: string) => {
        const off = document.createElement('canvas')
        off.width = width
        off.height = height
        const octx = off.getContext('2d')!
        octx.font = `${fontSize}px "Horizon"`
        octx.textAlign = 'center'
        octx.textBaseline = 'top'
        lines.forEach((_, i) => {
          const lw = lineWidths[i]
          const rx = cx - lw / 2 - padX
          const ry = blockY + padY + i * lineHeight - padY / 2
          const rw = lw + padX * 2
          const rh = lineHeight + padY / 2
          octx.fillRect(rx, ry, rw, rh)
        })
        octx.fillRect(recapRx, recapRy, recapRw, recapRh)
        octx.globalCompositeOperation = 'source-in'
        octx.fillStyle = color
        octx.fillRect(0, 0, width, height)
        return off
      }

      ctx.drawImage(makeOffscreen(RED), shadow, shadow)
      ctx.drawImage(makeOffscreen(DARK), 0, 0)

      ctx.font = `${fontSize}px "Horizon"`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#ffffff'
      lines.forEach((line, i) => {
        ctx.fillText(line, cx, blockY + padY + i * lineHeight)
      })

      ctx.font = `${recapSize}px "Horizon"`
      ctx.fillStyle = RED
      ctx.fillText('RECAP', cx, recapY)

      segmentName(ctx, {
        lines: ['KNOCK OUT', 'REPORTS'],
        x: 160,
        y: height - 180,
        font: '40px "Horizon"',
        color: RED,
        bgColor: DARK,
        padX: 16,
        padY: 0.4,
        lineHeight: 38,
      })

      tripleArrow(ctx, { color: RED, gap: 4, size: 42, x: width - 320, y: height - 160 })
    }

    const proceed = (loadedBg: HTMLImageElement) =>
      fontReady.current!.then(() => render(loadedBg))

    if (bg.complete) proceed(bg)
    else bg.onload = () => proceed(bg)
  }
}

const BoardItem = forwardRef<DBoardHandle, {
  bgImage: string
  title: string
  image: string | null
  name: string
  placementLabel: string
  showArrow: boolean
  imgCache: Map<string, HTMLImageElement>
  fontReady: { current: Promise<void> | null }
}>(function BoardItem({ bgImage, title, image: controllerImage, name, placementLabel, showArrow, imgCache, fontReady }, ref) {
  const draw = useCallback(
    controllerImage
      ? makeControllerDraw(bgImage, controllerImage, name, placementLabel, imgCache, fontReady, showArrow)
      : makeDraw(bgImage, title, imgCache, fontReady),
    [bgImage, title, controllerImage, name, placementLabel, showArrow]
  )
  return <DBoard ref={ref} width={1440} height={1800} previewWidth={360} drawAction={draw} />
})


export default function KnockoutRecap() {
  const [bgImage] = useState('/ko-report.png')
  const [title, setTitle] = useState('TOURNAMENT\nRECAP')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [winners, setWinners] = useState<Winner[]>([]);

  const boardRef = useRef<DBoardHandle>(null)
  const boardRefs = useRef<(DBoardHandle | null)[]>([])
  const imgCache = useRef(new Map<string, HTMLImageElement>())
  const fontReady = useRef<Promise<void> | null>(null)

  function saveAsImage() {
    const refs = [boardRef.current, ...boardRefs.current]
    refs.forEach((ref, i) => {
      const url = ref?.toDataURL()
      if (!url) return
      const a = document.createElement('a')
      a.href = url
      a.download = `knockout-recap-${i}.png`
      a.click()
    })
  }

  const draw = useCallback(
    makeDraw(bgImage, title, imgCache.current, fontReady),
    [bgImage, title]
  )

  const onAddWinner = () => {
    setWinners((prev) => [...prev, { id: crypto.randomUUID(), name: '', imageUrl: '' }])
  }

  const onChangeWinner = (index: number, patch: Partial<Pick<Winner, 'name' | 'imageUrl'>>) => {
    setWinners((prev) => prev.map((w, i) => i === index ? { ...w, ...patch } : w))
  }

  const onRemoveWinner = (index: number) => {
    setWinners((prev) => prev.filter((_, i) => i !== index))
  }

  const onMoveWinner = (index: number, direction: 'up' | 'down') => {
    setWinners((prev) => {
      const next = [...prev]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= next.length) return prev
        ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return (
    <div className="flex h-full bg-black">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setSidebarOpen((o) => !o)}
        className={`md:hidden fixed bottom-4 right-4 z-50 border-2 border-[${ACCENT}] bg-black text-[${ACCENT}] text-xs font-bold uppercase px-3 py-2 hover:bg-[${ACCENT}] hover:text-black transition-colors cursor-pointer`}
      >
        {sidebarOpen ? 'Close' : 'Menu'}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-black border-r-2 border-[${ACCENT}] flex flex-col gap-4 p-4 overflow-y-auto
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shrink-0 md:min-h-0
      `}>
        <label className={`flex flex-col gap-1 text-xs font-bold uppercase text-[${ACCENT}]`}>
          Title (one line per row)
          <textarea
            className={`border-2 border-[${ACCENT}] px-2 py-1 text-sm bg-black text-[${ACCENT}] outline-none resize-none`}
            rows={4}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <WinnerList winners={winners} onAddWinner={onAddWinner} onRemoveWinner={onRemoveWinner} onMoveWinner={onMoveWinner} onChangeWinner={onChangeWinner} />
        <button
          type="button"
          className={`mt-auto border-2 border-[${ACCENT}] px-3 py-2 text-xs font-bold uppercase text-[${ACCENT}] hover:bg-[${ACCENT}] hover:text-black transition-colors cursor-pointer`}
          onClick={saveAsImage}
        >
          Save all as image
        </button>
      </aside>
      <main className="flex-1 flex items-center overflow-x-auto gap-4 px-4">
        <DBoard ref={boardRef} width={1440} height={1800} previewWidth={360} drawAction={draw} />
        {winners.map((winner, i) => (
          <BoardItem
            key={winner.id}
            ref={(el) => { boardRefs.current[i] = el }}
            bgImage={bgImage}
            title={title}
            image={winner.imageUrl}
            name={winner.name}
            placementLabel={placement(winners.length - 1 - i)}
            showArrow={i < winners.length - 1}
            imgCache={imgCache.current}
            fontReady={fontReady}
          />
        ))}
      </main>
    </div>
  )
}
