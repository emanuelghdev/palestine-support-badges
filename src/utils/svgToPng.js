// Convierte una URL de SVG (puede ser una URL remota) a DataURL PNG.
export async function svgUrlToPngDataUrl(svgUrl, scale = 1) {
  // Recuperamos el SVG como texto para evitar problemas cors con drawImage
  const resp = await fetch(svgUrl)
  if (!resp.ok) throw new Error('Failed to fetch SVG')
  const svgText = await resp.text()
  // Hacer un blob
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  try {
    const img = new Image()
    img.src = url
    await new Promise((res, rej) => {
      img.onload = res
      img.onerror = rej
    })
    const w = img.width * scale || 300
    const h = img.height * scale || 80
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, w, h)
    const pngDataUrl = canvas.toDataURL('image/png')
    return pngDataUrl
  } finally {
    URL.revokeObjectURL(url)
  }
}