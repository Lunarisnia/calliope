'use client'

import { useState, useCallback, useRef } from 'react'
import DBoard from '@/app/components/DBoard'
import { tripleArrow } from '@/app/components/DBoard/drawing-actions/triple-arrow'

export default function FightstickFriday() {
  const [bgImage, setBgImage] = useState('/W1.png')
  const [host, setHost] = useState('Louna')
  // 1. Create a canvas
  // 2. Render bg on a canvas
  // 3. Render text on top of the canvas
  // 4. Render image on top of the canvas
  // 5. Save to an image

  // TODO: I can abstract out the creation of canvas
  // TODO: I can create a button to spawn a new canvas
  // TODO: Multi canvas scrolls horizontally
  // TODO: I can focus on a canvas and it would show the state of that page
  // TODO: Multi canvas in a single page

  const imgCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const fontReady = useRef<Promise<FontFace[]> | null>(null)

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

      ctx.font = '800 200px "Barlow Condensed"'
      ctx.fillText(host.toUpperCase(), cx, height * 0.67)

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
    <div className="flex h-full items-center justify-center">
      <DBoard width={1440} height={1800} previewWidth={360} drawAction={draw} />
    </div>
  )
}
