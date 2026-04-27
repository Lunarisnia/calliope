'use client'

import { useState, useRef, useEffect } from 'react'

export default function FightstickFriday() {
  const [bgImage, setBgImage] = useState('https://fastly.picsum.photos/id/1/1440/1800.jpg?hmac=dTX3EZvsbTACYOE0nvBUYPvNxop_uRHzqwKUHtE6_-M')
  const [host, setHost] = useState('Louna')

  // TODO: I can abstract out the creation of canvas
  // TODO: I can create a button to spawn a new canvas 
  // TODO: Multi canvas scrolls horizontally
  // TODO: I can focus on a canvas and it would show the state of that page
  // TODO: Multi canvas in a single page
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2)
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
          <canvas ref={canvasRef} width={360} height={450} />
        </div>
      </main>
    </div>
  )
}
