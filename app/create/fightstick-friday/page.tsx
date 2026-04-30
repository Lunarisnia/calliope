'use client'

import { useState, useCallback, useRef, forwardRef } from 'react'
import dynamic from 'next/dynamic'
import type { DBoardHandle } from '@/app/components/DBoard'
import { tripleArrow } from '@/app/components/DBoard/drawing-actions/triple-arrow'
import { IUploadedImage } from './types/controller-images'

const DBoard = dynamic(() => import('@/app/components/DBoard'), { ssr: false })


function loadImg(img: HTMLImageElement): Promise<HTMLImageElement> {
  return img.complete ? Promise.resolve(img) : new Promise(res => img.addEventListener('load', () => res(img), { once: true }))
}

async function loadFonts(): Promise<void> {
  const regular = new FontFace('Horizon', 'url(/Horizon_Regular.otf)')
  const outlined = new FontFace('Horizon Outlined', 'url(/Horizon_Outlined.otf)')
  return Promise.all([regular.load(), outlined.load()]).then(([r, o]) => {
    document.fonts.add(r)
    document.fonts.add(o)
  })
}

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

      // "Via +CREW Exclusive" — top right of image
      ctx.font = '36px "Horizon"'
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText('Via +CREW Exclusive', cx + cw, cy - 16)

      // Logo (unblurred)
      const drawLogo = () => ctx.drawImage(logo, 70, 60, logo.naturalWidth * 0.3, logo.naturalHeight * 0.3)
      if (logo.complete) drawLogo()
      else logo.addEventListener('load', drawLogo, { once: true })

      // Bottom-left text aligned with chevron
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.font = '40px "Horizon"'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 6
      ctx.lineJoin = 'round'
      ctx.strokeText('FIGHTSTICK', 60, height - 180)
      ctx.strokeText('FRIDAY', 60, height - 140)
      ctx.fillStyle = '#fff'
      ctx.fillText('FIGHTSTICK', 60, height - 180)
      ctx.fillText('FRIDAY', 60, height - 140)

      // Triple arrow (unblurred)
      tripleArrow(ctx, { color: '#ffffff', gap: 4, size: 80, x: width - 320, y: height - 160 })
    })
  }
}

function makeDraw(
  bgImage: string,
  host: string,
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

      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      const cx = width / 2

      ctx.font = '120px "Horizon"'
      ctx.fillStyle = '#fff'
      ctx.fillText('FIGHTSTICK', cx, height * 0.41)

      ctx.font = '200px "Horizon"'
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 8
      ctx.lineJoin = 'round'
      ctx.strokeText('FRIDAY', cx, height * 0.50)

      ctx.font = '96px "Horizon"'
      ctx.fillStyle = '#fff'
      ctx.fillText('WITH', cx, height * 0.56)

      let hostSize = 140
      ctx.font = `${hostSize}px "Horizon"`
      while (ctx.measureText(host.toUpperCase()).width > width * 0.8 && hostSize > 1) {
        hostSize--
        ctx.font = `${hostSize}px "Horizon"`
      }
      ctx.fillText(host.toUpperCase(), cx, height * 0.64 - (200 - hostSize) / 2)

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
  fontReady: { current: Promise<void> | null }
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
  return <div className='border-2 border-[#ff2255] overflow-hidden text-[#ff2255] flex items-center shrink-0'>
    <p className='flex-1 px-2 py-1 text-xs truncate'>{image.filename}</p>
    <button onClick={onRemove} className='shrink-0 border-l-2 border-[#ff2255] px-2 py-1 text-xs hover:bg-[#ff2255] hover:text-black cursor-pointer'>✕</button>
  </div>
}

export default function FightstickFriday() {
  const [bgImage, setBgImage] = useState('/W1.png')
  const bgInputRef = useRef<HTMLInputElement>(null)
  const [controllerImages, setControllerImages] = useState<IUploadedImage[]>([])
  const [generatedImages, setGeneratedImages] = useState<(IUploadedImage | null)[]>([])
  const [host, setHost] = useState('Louna')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
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
      a.download = `fightstick-friday-${host.toLowerCase()}-${i}.png`
      a.click()
    })
  }

  const draw = useCallback(
    makeDraw(bgImage, host, imgCache.current, fontReady),
    [bgImage, host]
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
          Background image
          <input
            ref={bgInputRef}
            type="file"
            accept="image/*"
            className="relative text-xs text-[#ff2255] border-2 border-[#ff2255] px-2 py-1 cursor-pointer w-full bg-black file:bg-[#ff2255] file:text-black file:border-0 file:text-xs file:font-bold file:uppercase file:cursor-pointer file:mr-2 file:px-2"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const prev = bgImage
              const url = URL.createObjectURL(file)
              if (prev !== '/W1.png') URL.revokeObjectURL(prev)
              imgCache.current.delete(prev)
              setBgImage(url)
            }}
          />
          {bgImage !== '/W1.png' && (
            <button
              type="button"
              className="text-xs text-[#ff225566] hover:text-[#ff2255] text-left cursor-pointer uppercase font-bold"
              onClick={() => {
                URL.revokeObjectURL(bgImage)
                imgCache.current.delete(bgImage)
                setBgImage('/W1.png')
                if (bgInputRef.current) bgInputRef.current.value = ''
              }}
            >
              Reset to default
            </button>
          )}
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[#ff2255]">
          Host
          <input
            className="border-2 border-[#ff2255] px-2 py-1 text-sm bg-black text-[#ff2255] outline-none"
            value={host}
            onChange={(e) => setHost(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[#ff2255]">
          Controller images
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="relative text-xs text-[#ff2255] border-2 border-[#ff2255] px-2 py-1 cursor-pointer w-full bg-black file:bg-[#ff2255] file:text-black file:border-0 file:text-xs file:font-bold file:uppercase file:cursor-pointer file:mr-2 file:px-2"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              const urls = files.map((f) => {
                const url = URL.createObjectURL(f);
                return {
                  id: url,
                  filename: f.name,
                  url: url,
                } as IUploadedImage
              })
              if (fileInputRef.current) fileInputRef.current.value = ''
              setControllerImages((prev) => {
                const next = [...prev, ...urls]
                setGeneratedImages([null, ...next])
                return next
              })
            }}
          />
        </label>
        {controllerImages.map((image) => {
          const remove = () => {
            URL.revokeObjectURL(image.url)
            setControllerImages((prev) => prev.filter((i) => i.id !== image.id))
            setGeneratedImages((prev) => prev.filter((i) => i?.id !== image.id))
          }
          return <UploadedImage image={image} key={image.id} onRemove={remove} />
        })}
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
