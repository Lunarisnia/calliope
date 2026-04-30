'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { DBoardHandle } from '@/app/components/DBoard'
import { tripleArrow } from '@/app/components/DBoard/drawing-actions/triple-arrow'

const DBoard = dynamic(() => import('@/app/components/DBoard'), { ssr: false })

export default function FightstickFriday() {
  const [bgImage, setBgImage] = useState('/W1.png')
  const [controllerImages, setControllerImages] = useState<string[]>([])
  const [hostInput, setHostInput] = useState('Louna')
  const [host, setHost] = useState('Louna')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function onHostChange(value: string) {
    setHostInput(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setHost(value), 300)
  }

  // TODO: I can abstract out the creation of canvas
  // TODO: I can create a button to spawn a new canvas
  // TODO: Multi canvas scrolls horizontally
  // TODO: I can focus on a canvas and it would show the state of that page
  // TODO: Multi canvas in a single page

  const boardRef = useRef<DBoardHandle>(null)
  const imgCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const fontReady = useRef<Promise<FontFace[]> | null>(null)

  function saveAsImage() {
    const url = boardRef.current?.toDataURL()
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `fightstick-friday-${host.toLowerCase()}-0.png`
    a.click()
  }

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    // Cache image per URL
    let img = imgCache.current.get(bgImage)
    if (!img) {
      img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = bgImage
      imgCache.current.set(bgImage, img)
    }

    // Cache font load promise
    if (!fontReady.current) {
      fontReady.current = document.fonts.load('800 1px "Barlow Condensed"')
    }

    const logo = imgCache.current.get('/Box_Logo_Black.png') ?? (() => {
      const l = new Image()
      l.src = '/Box_Logo_Black.png'
      imgCache.current.set('/Box_Logo_Black.png', l)
      return l
    })()

    const render = (loadedImg: HTMLImageElement) => {
      ctx.drawImage(loadedImg, 0, 0, width, height)

      const drawLogo = () => ctx.drawImage(logo, 70, 60, logo.naturalWidth * 0.3, logo.naturalHeight * 0.3)
      if (logo.complete) drawLogo()
      else logo.onload = drawLogo

      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      const cx = width / 2

      ctx.font = '800 200px "Barlow Condensed"'
      ctx.fillStyle = '#fff'
      ctx.fillText('FIGHTSTICK', cx, height * 0.38)

      ctx.font = '800 272px "Barlow Condensed"'
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 12
      ctx.lineJoin = 'round'
      ctx.strokeText('FRIDAY', cx, height * 0.50)

      ctx.font = '800 96px "Barlow Condensed"'
      ctx.fillStyle = '#fff'
      ctx.fillText('WITH', cx, height * 0.56)

      let hostSize = 200
      ctx.font = `800 ${hostSize}px "Barlow Condensed"`
      while (ctx.measureText(host.toUpperCase()).width > width * 0.8 && hostSize > 1) {
        hostSize--
        ctx.font = `800 ${hostSize}px "Barlow Condensed"`
      }
      const hostY = height * 0.67 - (200 - hostSize) / 2
      ctx.fillText(host.toUpperCase(), cx, hostY)

      tripleArrow(ctx, {
        color: "#ffffff",
        gap: 4,
        size: 80,
        x: width - 320,
        y: height - 160,
      })
    }

    const proceed = (loadedImg: HTMLImageElement) =>
      fontReady.current!.then(() => render(loadedImg))

    if (img.complete) {
      proceed(img)
    } else {
      img.onload = () => proceed(img!)
    }
  }, [bgImage, host])

  return (
    <div className="flex h-full">
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col gap-4 p-4">
        <label className="flex flex-col gap-1 text-sm text-black">
          Host
          <input
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={hostInput}
            onChange={(e) => onHostChange(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-black">
          Controller images
          <input
            type="file"
            accept="image/*"
            multiple
            className="text-sm text-black border border-gray-300 rounded px-2 py-1"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              const urls = files.map((f) => URL.createObjectURL(f))
              setControllerImages((prev) => {
                prev.forEach(URL.revokeObjectURL)
                return urls
              })
            }}
          />
          {controllerImages.length > 0 && (
            <span className="text-xs text-gray-400">{controllerImages.length} image{controllerImages.length > 1 ? 's' : ''} selected</span>
          )}
        </label>
        <button
          type="button"
          className="border border-gray-300 rounded px-3 py-2 text-sm text-black hover:bg-gray-50 cursor-pointer active:bg-black active:text-white active:border-black"
        >
          Generate
        </button>
        <button
          type="button"
          className="mt-auto border border-gray-300 rounded px-3 py-2 text-sm text-black hover:bg-gray-50 cursor-pointer active:bg-black active:text-white active:border-black"
          onClick={saveAsImage}
        >
          Save as image
        </button>
      </aside>
      <main className="flex-1 flex items-center justify-center">
        <DBoard ref={boardRef} width={1440} height={1800} previewWidth={360} drawAction={draw} />
      </main>
    </div>
  )
}
