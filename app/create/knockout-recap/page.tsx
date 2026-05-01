'use client'

import { useState, useCallback, useRef, forwardRef } from 'react'
import dynamic from 'next/dynamic'
import type { DBoardHandle } from '@/app/components/DBoard'
import { tripleArrow } from '@/app/components/DBoard/drawing-actions/triple-arrow'
import { IUploadedImage } from '@/app/types/upload'
import MultiImageUpload from '@/app/components/MultiImageUpload'
import { loadImg } from '@/app/utils/loadImg'
import { loadFonts } from '@/app/utils/loadFonts'

const DBoard = dynamic(() => import('@/app/components/DBoard'), { ssr: false })

function makeControllerDraw(
  bgImage: string,
  controllerImage: string,
  imgCache: Map<string, HTMLImageElement>,
  fontReady: { current: Promise<void> | null },
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
      const cy = (height - ch) / 2
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

      // Logo (unblurred)
      const drawLogo = () => ctx.drawImage(logo, 70, 60, logo.naturalWidth * 0.3, logo.naturalHeight * 0.3)
      if (logo.complete) drawLogo()
      else logo.addEventListener('load', drawLogo, { once: true })

      // Bottom-left text with per-line dark background
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.font = '40px "Horizon"'
      const padX = 16
      const padY = 10
      const lineH = 38
      const textX = 60
      const textY1 = height - 180
      const textY2 = textY1 + lineH
      const w1 = ctx.measureText('FIGHTSTICK').width
      const w2 = ctx.measureText('FRIDAY').width
      ctx.fillStyle = '#111111'
      ctx.fillRect(textX - padX, textY1 - padY, w1 + padX * 2, lineH + padY * 2)
      ctx.fillRect(textX - padX, textY2 - padY, w2 + padX * 2, lineH + padY * 2)
      ctx.fillStyle = '#fff'
      ctx.fillText('FIGHTSTICK', textX, textY1)
      ctx.fillText('FRIDAY', textX, textY2)

      // Triple arrow (unblurred)
      tripleArrow(ctx, { color: '#ffffff', gap: 4, size: 42, x: width - 320, y: height - 160 })
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
      const recapSize = Math.round(fontSize * 0.85)
      const padX = 80
      const padY = 60

      ctx.font = `${fontSize}px "Horizon"`
      const lineWidths = lines.map(l => ctx.measureText(l).width)
      const textBlockW = Math.max(...lineWidths)
      const titleBlockH = lines.length * lineHeight

      ctx.font = `${recapSize}px "Horizon"`
      const recapW = ctx.measureText('RECAP').width

      const contentH = titleBlockH + recapSize * 1.5

      const blockH = contentH + padY * 2
      const cx = width / 2
      const blockY = (height - blockH) / 2

      const shadow = 14  // red offset shift

      // Per-line dark rect + title text (centered)
      ctx.font = `${fontSize}px "Horizon"`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      lines.forEach((line, i) => {
        const lw = lineWidths[i]
        const rx = cx - lw / 2 - padX
        const ry = blockY + padY + i * lineHeight - padY / 2
        const rw = lw + padX * 2
        const rh = lineHeight + padY / 2
        ctx.fillStyle = '#ff2255'
        ctx.fillRect(rx + shadow, ry + shadow, rw, rh)
        ctx.fillStyle = 'rgba(15, 15, 15, 0.92)'
        ctx.fillRect(rx, ry, rw, rh)
        ctx.fillStyle = '#ffffff'
        ctx.fillText(line, cx, blockY + padY + i * lineHeight)
      })

      // RECAP rect + text (centered)
      const recapY = blockY + padY + titleBlockH + recapSize * 0.3
      const recapRx = cx - recapW / 2 - padX
      const recapRy = recapY - padY / 2
      const recapRw = recapW + padX * 2
      const recapRh = recapSize * 1.4
      ctx.fillStyle = '#ff2255'
      ctx.fillRect(recapRx + shadow, recapRy + shadow, recapRw, recapRh)
      ctx.fillStyle = 'rgba(15, 15, 15, 0.92)'
      ctx.fillRect(recapRx, recapRy, recapRw, recapRh)
      ctx.font = `${recapSize}px "Horizon"`
      ctx.fillStyle = '#ff2255'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('RECAP', cx, recapY)

      tripleArrow(ctx, { color: '#ffffff', gap: 4, size: 42, x: width - 320, y: height - 160 })
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
  controllerImage: string | null
  imgCache: Map<string, HTMLImageElement>
  fontReady: { current: Promise<void> | null }
}>(function BoardItem({ bgImage, title, controllerImage, imgCache, fontReady }, ref) {
  const draw = useCallback(
    controllerImage
      ? makeControllerDraw(bgImage, controllerImage, imgCache, fontReady)
      : makeDraw(bgImage, title, imgCache, fontReady),
    [bgImage, title, controllerImage]
  )
  return <DBoard ref={ref} width={1440} height={1800} previewWidth={360} drawAction={draw} />
})


export default function KnockoutRecap() {
  const [bgImage] = useState('/ko-report.png')
  const [generatedImages, setGeneratedImages] = useState<(IUploadedImage | null)[]>([])
  const [title, setTitle] = useState('TOURNAMENT\nRECAP')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const boardRef = useRef<DBoardHandle>(null)
  const boardRefs = useRef<(DBoardHandle | null)[]>([])
  const imgCache = useRef(new Map<string, HTMLImageElement>())
  const fontReady = useRef<Promise<void> | null>(null)

  function saveAsImage() {
    const refs = generatedImages.length > 0 ? boardRefs.current : [boardRef.current]
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

  return (
    <div className="flex h-full bg-black">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setSidebarOpen((o) => !o)}
        className="md:hidden fixed bottom-4 right-4 z-50 border-2 border-[#ff2255] bg-black text-[#ff2255] text-xs font-bold uppercase px-3 py-2 hover:bg-[#ff2255] hover:text-black transition-colors cursor-pointer"
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
        fixed inset-y-0 left-0 z-40 w-64 bg-black border-r-2 border-[#ff2255] flex flex-col gap-4 p-4 overflow-y-auto
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shrink-0 md:min-h-0
      `}>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[#ff2255]">
          Title (one line per row)
          <textarea
            className="border-2 border-[#ff2255] px-2 py-1 text-sm bg-black text-[#ff2255] outline-none resize-none"
            rows={4}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <MultiImageUpload
          label="Controller images"
          onChange={(imgs) => {
            setGeneratedImages([null, ...imgs])
          }}
        />
        <button
          type="button"
          className="mt-auto border-2 border-[#ff2255] px-3 py-2 text-xs font-bold uppercase text-[#ff2255] hover:bg-[#ff2255] hover:text-black transition-colors cursor-pointer"
          onClick={saveAsImage}
        >
          Save all as image
        </button>
      </aside>
      <main className="flex-1 flex items-center overflow-x-auto gap-4 px-4">
        {generatedImages.length > 0 ? (
          generatedImages.map((img, i) => (
            <BoardItem
              key={img?.url ?? 'title'}
              ref={(el) => { boardRefs.current[i] = el }}
              bgImage={bgImage}
              title={title}
              controllerImage={img?.url || null}
              imgCache={imgCache.current}
              fontReady={fontReady}
            />
          ))
        ) : (
          <DBoard ref={boardRef} width={1440} height={1800} previewWidth={360} drawAction={draw} />
        )}
      </main>
    </div>
  )
}
