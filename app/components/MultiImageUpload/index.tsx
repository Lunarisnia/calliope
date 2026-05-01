'use client'

import { useRef, useState } from 'react'
import { IUploadedImage } from '@/app/types/upload'

interface Props {
  label?: string
  onChange: (images: IUploadedImage[]) => void
}

export default function MultiImageUpload({ label = 'Images', onChange }: Props) {
  const [images, setImages] = useState<IUploadedImage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function add(files: File[]) {
    const urls = files.map((f) => {
      const url = URL.createObjectURL(f)
      return { id: url, filename: f.name, url } as IUploadedImage
    })
    if (inputRef.current) inputRef.current.value = ''
    setImages((prev) => [...prev, ...urls])
    onChange([...images, ...urls])
  }

  function remove(image: IUploadedImage) {
    URL.revokeObjectURL(image.url)
    const next = images.filter((i) => i.id !== image.id)
    setImages(next)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[#ff2255]">
        {label}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="relative text-xs text-[#ff2255] border-2 border-[#ff2255] px-2 py-1 cursor-pointer w-full bg-black file:bg-[#ff2255] file:text-black file:border-0 file:text-xs file:font-bold file:uppercase file:cursor-pointer file:mr-2 file:px-2"
          onChange={(e) => add(Array.from(e.target.files ?? []))}
        />
      </label>
      {images.map((image) => (
        <div key={image.id} className="border-2 border-[#ff2255] overflow-hidden text-[#ff2255] flex items-center shrink-0">
          <p className="flex-1 px-2 py-1 text-xs truncate">{image.filename}</p>
          <button
            onClick={() => remove(image)}
            className="shrink-0 border-l-2 border-[#ff2255] px-2 py-1 text-xs hover:bg-[#ff2255] hover:text-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
