'use client'

import { useState, useCallback } from 'react'
import DBoard from '@/app/components/DBoard'

export default function FightstickFriday() {
  const [bgImage, setBgImage] = useState('https://fastly.picsum.photos/id/1/1440/1800.jpg?hmac=dTX3EZvsbTACYOE0nvBUYPvNxop_uRHzqwKUHtE6_-M')
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

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, 10, 0, Math.PI * 2)
    ctx.fillStyle = 'red'
    ctx.fill()
  }, [])

  return (
    <div className="flex h-full">
      <aside className="w-64 shrink-0 bg-white h-full flex items-center justify-center">
        <button
          type="button"
          className="px-4 py-2 bg-red-500 rounded hover:bg-blue-500"
        >
          Press me
        </button>
      </aside>
      <main className="flex-1 flex items-center justify-center">
        <div className="border border-gray-300 overflow-hidden" style={{ width: 360, height: 450 }}>
          <DBoard width={360} height={450} draw={draw} />
        </div>
      </main>
    </div>
  )
}
