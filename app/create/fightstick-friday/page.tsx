'use client'

import { useState, useCallback, useRef, forwardRef } from 'react'
import dynamic from 'next/dynamic'
import type { DBoardHandle } from '@/app/components/DBoard'
import { tripleArrow } from '@/app/components/DBoard/drawing-actions/triple-arrow'
import { IUploadedImage } from './types/controller-images'

const DBoard = dynamic(() => import('@/app/components/DBoard'), { ssr: false })

function loadImg(img: HTMLImageElement): Promise<HTMLImageElement> {
  return img.complete ? Promise.resolve(img) : new Promise(res => { img.onload = () => res(img) })
}

function makeControllerDraw(
  bgImage: string,
  controllerImage: string,
  imgCache: Map<string, HTMLImageElement>,
  fontReady: { current: Promise<FontFace[]> | null },
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
      fontReady.current = document.fonts.load('800 1px "Barlow Condensed"')
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

      // "Via +CREW Exclusive" — top right of image
      ctx.font = '800 36px "Barlow Condensed"'
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText('Via +CREW Exclusive', cx + cw, cy - 16)

      // Logo (unblurred)
      const drawLogo = () => ctx.drawImage(logo, 70, 60, logo.naturalWidth * 0.3, logo.naturalHeight * 0.3)
      if (logo.complete) drawLogo()
      else logo.onload = drawLogo

      // Bottom-left text aligned with chevron
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#fff'
      ctx.font = '800 80px "Barlow Condensed"'
      ctx.fillText('FIGHTSTICK', 60, height - 180)
      ctx.fillText('FRIDAY', 60, height - 100)

      // Triple arrow (unblurred)
      tripleArrow(ctx, { color: '#ffffff', gap: 4, size: 80, x: width - 320, y: height - 160 })
    })
  }
}

function makeDraw(
  bgImage: string,
  host: string,
  imgCache: Map<string, HTMLImageElement>,
  fontReady: { current: Promise<FontFace[]> | null }
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
      fontReady.current = document.fonts.load('800 1px "Barlow Condensed"')
    }

    const render = (loadedBg: HTMLImageElement) => {
      ctx.drawImage(loadedBg, 0, 0, width, height)

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
      ctx.fillText(host.toUpperCase(), cx, height * 0.67 - (200 - hostSize) / 2)

      tripleArrow(ctx, { color: '#ffffff', gap: 4, size: 80, x: width - 320, y: height - 160 })
    }

    const proceed = (loadedBg: HTMLImageElement) =>
      fontReady.current!.then(() => render(loadedBg))

    if (bg.complete) proceed(bg)
    else bg.onload = () => proceed(bg)
  }
}

const BoardItem = forwardRef<DBoardHandle, {
  bgImage: string
  host: string
  controllerImage: string | null
  imgCache: Map<string, HTMLImageElement>
  fontReady: { current: Promise<FontFace[]> | null }
}>(function BoardItem({ bgImage, host, controllerImage, imgCache, fontReady }, ref) {
  const draw = useCallback(
    controllerImage
      ? makeControllerDraw(bgImage, controllerImage, imgCache, fontReady)
      : makeDraw(bgImage, host, imgCache, fontReady),
    [bgImage, host, controllerImage]
  )
  return <DBoard ref={ref} width={1440} height={1800} previewWidth={360} drawAction={draw} />
})

const UploadedImage = ({ image, onRemove }: { image: IUploadedImage; onRemove: () => void }) => {
  return <div className='outline outline-1 outline-black overflow-hidden text-black flex items-center rounded shrink-0'>
    <p className='flex-1 px-2 py-1 text-xs truncate'>{image.filename}</p>
    <button onClick={onRemove} className='shrink-0 border-l border-black px-2 py-1 text-xs hover:bg-black hover:text-white cursor-pointer'>✕</button>
  </div>
}

export default function FightstickFriday() {
  const [bgImage] = useState('/W1.png')
  const [controllerImages, setControllerImages] = useState<IUploadedImage[]>([])
  const [generatedImages, setGeneratedImages] = useState<(IUploadedImage | null)[]>([])
  const [hostInput, setHostInput] = useState('Louna')
  const [host, setHost] = useState('Louna')

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const boardRef = useRef<DBoardHandle>(null)
  const boardRefs = useRef<(DBoardHandle | null)[]>([])
  const imgCache = useRef(new Map<string, HTMLImageElement>())
  const fontReady = useRef<Promise<FontFace[]> | null>(null)

  function onHostChange(value: string) {
    setHostInput(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setHost(value), 300)
  }

  function saveAsImage() {
    const refs = generatedImages.length > 0 ? boardRefs.current : [boardRef.current]
    refs.forEach((ref, i) => {
      const url = ref?.toDataURL()
      if (!url) return
      const a = document.createElement('a')
      a.href = url
      a.download = `fightstick-friday-${host.toLowerCase()}-${i}.png`
      a.click()
    })
  }

  const draw = useCallback(
    makeDraw(bgImage, host, imgCache.current, fontReady),
    [bgImage, host]
  )

  return (
    <div className="flex h-full">
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col gap-4 p-4 overflow-y-auto min-h-0">
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
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="text-sm text-black border border-gray-300 rounded px-2 py-1"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              const urls = files.map((f) => {
                return {
                  filename: f.name,
                  url: URL.createObjectURL(f),
                } as IUploadedImage
              })
              if (fileInputRef.current) fileInputRef.current.value = ''
              setControllerImages((prev) => {
                prev.forEach((image) => {
                  URL.revokeObjectURL(image.url)
                })
                return urls
              })
            }}
          />
          {controllerImages.length > 0 && (
            <span className="text-xs text-gray-400">
              {controllerImages.length} image{controllerImages.length > 1 ? 's' : ''} selected
            </span>
          )}
        </label>
        {controllerImages.map((image) => {
          const remove = () => {
            URL.revokeObjectURL(image.url)
            setControllerImages((prev) => prev.filter((i) => i.filename !== image.filename))
            setGeneratedImages((prev) => prev.filter((i) => i?.filename !== image.filename))
          }
          return <UploadedImage image={image} key={image.filename} onRemove={remove} />
        })}
        <button
          type="button"
          className="border border-gray-300 rounded px-3 py-2 text-sm text-black hover:bg-gray-50 cursor-pointer active:bg-black active:text-white active:border-black"
          onClick={() => setGeneratedImages([null, ...controllerImages])}
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
      <main className="flex-1 flex items-center overflow-x-auto gap-4 px-4">
        {generatedImages.length > 0 ? (
          generatedImages.map((img, i) => (
            <BoardItem
              key={img?.url ?? 'title'}
              ref={(el) => { boardRefs.current[i] = el }}
              bgImage={bgImage}
              host={host}
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
