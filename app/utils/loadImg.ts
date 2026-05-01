export function loadImg(img: HTMLImageElement): Promise<HTMLImageElement> {
  return img.complete ? Promise.resolve(img) : new Promise(res => img.addEventListener('load', () => res(img), { once: true }))
}
