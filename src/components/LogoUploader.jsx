import React from 'react'

// Recibe onChange(base64string) y allowCustom boolean
export default function LogoUploader({ onChange, value, t }) {
  const fileInputRef = React.useRef(null)

  function safeBase64Encode(str) {
    // Manejo de unicode
    try {
      return window.btoa(unescape(encodeURIComponent(str)))
    } catch (e) {
      // Fallback menos seguro
      return window.btoa(str)
    }
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result
      // Si no es texto (p. ej. .svg como XML) lo guardamos
      const base64 = safeBase64Encode(text)
      const dataUrl = `data:image/svg+xml;base64,${base64}`
      onChange(dataUrl)
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{t('Upload logo (SVG)')}</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/svg+xml"
        onChange={handleFile}
        className="block"
      />
      {value && (
        <div className="mt-2 flex items-center gap-2">
          <div className="p-1 border rounded bg-white">
            <img src={value} alt="logo preview" className="w-8 h-8" />
          </div>
          <button
            className="text-xs underline"
            onClick={() => { onChange('') }}
          >
            {t('Use custom logo')} (clear)
          </button>
        </div>
      )}
    </div>
  )
}