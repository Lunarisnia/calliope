export async function loadFonts(): Promise<void> {
  const regular = new FontFace('Horizon', 'url(/Horizon_Regular.otf)')
  const outlined = new FontFace('Horizon Outlined', 'url(/Horizon_Outlined.otf)')
  return Promise.all([regular.load(), outlined.load()]).then(([r, o]) => {
    document.fonts.add(r)
    document.fonts.add(o)
  })
}
