import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import useStickyState from './hooks/useStickyState'
import LogoUploader from './components/LogoUploader'
import LogoSelector, { getPresetLogoDataUrl } from './components/LogoSelector'
import BadgePreview from './components/BadgePreview'
import { svgUrlToPngDataUrl } from './utils/svgToPng'
import Banner from "./components/Banner";


export default function App() {
  const { t, i18n } = useTranslation()

  // Estados persistidos con localStorage
  const [label, setLabel] = useStickyState('build', 'badge_label')
  const [message, setMessage] = useStickyState('passing', 'badge_message')
  const [color, setColor] = useStickyState('4c1', 'badge_color')
  const [selectedLogoId, setSelectedLogoId] = useStickyState('', 'badge_selected_logo_id')
  const [history, setHistory] = useStickyState([], 'badge_history')
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)

  // Construir URL del badge según Shields.io
  function buildBadgeUrl() {
    const enc = v => encodeURIComponent(String(v || '').replace(/\s+/g, '%20'))

    // Shields.io acepta o el nombre del color o hexadecimal
    const colorSegment = color.startsWith('#') ? color.slice(1) : color
    const labelEnc = enc(label || '')
    const messageEnc = enc(message || '')
    let base = `https://img.shields.io/badge/${labelEnc}-${messageEnc}-${colorSegment}.svg`

    // Construir logos
    const params = new URLSearchParams()
    if (selectedLogoId) {
      const dataUrl = getPresetLogoDataUrl(selectedLogoId)
      if (dataUrl) params.set('logo', dataUrl)
    }

    const paramString = params.toString()
    return paramString ? `${base}?${paramString}` : base
  }

  const badgeUrl = buildBadgeUrl()

  async function handleDownloadPNG() {
    try {
      const pngDataUrl = await svgUrlToPngDataUrl(badgeUrl)
      const a = document.createElement('a')
      a.href = pngDataUrl
      a.download = 'badge.png'
      a.click()
      setToast({ title: 'Export successful', message: 'PNG downloaded', type: 'Download', isError: false })
    } catch (err) {
      setToast({ title: 'Failed to export PNG', message: err?.message ? String(err.message) : 'Unknown error', type: 'Download', isError: true })
    }

    // Limpiar timeout anterior si existe
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    // Autoocultar la alerta
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
      toastTimeoutRef.current = null
    }, 3000)
  }

  function handleSaveHistory() {
    const entry = {
      id: Date.now(),
      label,
      message,
      color,
      selectedLogoId,
      url: badgeUrl
    }
    setHistory(prev => [entry, ...prev].slice(0, 50))

    setToast({ title: 'Saved!', message: 'Badge stored successfully', type: 'History', isError: false })

    // Limpiar timeout anterior si existe
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    // Autoocultar la alerta
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
      toastTimeoutRef.current = null
    }, 3000)
  }

  function handleLoadEntry(entry) {
    setLabel(entry.label)
    setMessage(entry.message)
    setColor(entry.color)
    setSelectedLogoId(entry.selectedLogoId || '')
  }

  function handleClearHistory() {
    setHistory([])

    setToast({ title: 'Cleared!', message: 'History deleted successfully', type: 'Clear History', isError: false })

    // Limpiar timeout anterior si existe
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    // Autoocultar la alerta
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
      toastTimeoutRef.current = null
    }, 3000)
  }

  async function handleCopy(text, type = 'Item') {
    try {
      await navigator.clipboard.writeText(text)
      setToast({ title: 'Copied!', message: type + ' copied to clipboard', type, isError: false })
    } catch (e) {
      setToast({ title: 'Failed to copy', message: 'Could not copy ' + type + ' to clipboard', type, isError: true })
    }

    // Limpiar timeout anterior si existe
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    // Autoocultar la alerta
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
      toastTimeoutRef.current = null
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808014_1px,transparent_1px),linear-gradient(to_bottom,#80808014_1px,transparent_1px)] bg-[size:14px_24px]">
      {toast && (
        <div className="fixed bottom-10 right-10 z-50">
            {/* Variar colores del alert según toast.type */}
            <div role="alert" className={"toast-pop flex align-middle" +
              (
                toast.type === 'URL'
                ? "flex items-center p-4 mb-4 text-sm text-sky-800 border border-sky-300 rounded-lg bg-sky-50 dark:bg-gray-800 dark:text-sky-400"
                : toast.type === 'Markdown'
                ? "flex items-center p-4 mb-4 text-sm text-rose-800 border border-rose-300 rounded-lg bg-rose-50 dark:bg-gray-800 dark:text-rose-400"
                : toast.type === 'HTML'
                ? "flex items-center p-4 mb-4 text-sm text-emerald-800 border border-emerald-300 rounded-lg bg-emerald-50 dark:bg-gray-800 dark:text-emerald-400"
                : toast.type === 'History'
                ? "flex items-center p-4 mb-4 text-sm text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300"
                : toast.type === 'Download'
                ? "flex items-center p-4 mb-4 text-sm text-indigo-800 border border-indigo-300 rounded-lg bg-indigo-50 dark:bg-gray-800 dark:text-indigo-300"
                : toast.type === 'Clear History'
                ? "flex items-center p-4 mb-4 text-sm text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                : // fallback
                  (toast.isError ? "flex items-center p-4 mb-4 text-sm text-white rounded-lg bg-red-600" : "flex items-center p-4 mb-4 text-sm text-white rounded-lg bg-gray-600")
              )}>
              <svg className="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <span className="font-medium mr-2">{toast.title}</span>
              <span>{toast.message}</span>
            </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold">
            <span class="text-transparent bg-clip-text bg-gradient-to-r to-[#E4312b] from-[#149954]">Palestine Support</span> Badges
          </h1>

          {/* Selector de idioma */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>

            <select
              value={i18n.language}
              onChange={e => i18n.changeLanguage(e.target.value)}
              className="w-full pl-10 pr-12 py-2 text-base font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:border-black transition-all duration-200 hover:bg-gray-100 cursor-pointer">
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
              <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <section className="col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t('Label')}</span>
                <input className="border border-gray-300 rounded p-2" value={label} onChange={e => setLabel(e.target.value)} />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t('Message')}</span>
                <input className="border border-gray-300 rounded p-2" value={message} onChange={e => setMessage(e.target.value)} />
              </label>
            </div>

            <div className="flex flex-row content-start items-start gap-4 mb-8">
              <div>
                <label className="text-sm font-medium">{t('Color')}</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={color.startsWith('#') ? color : `#${color}`} onChange={e => setColor(e.target.value)} />
                  <input className="border border-gray-300 rounded h-10 p-2" value={color} onChange={e => setColor(e.target.value)} />
                </div>
              </div>

              <div>
                <LogoSelector selectedId={selectedLogoId} onSelect={setSelectedLogoId} />
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button className="px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => handleCopy(badgeUrl, "URL")}>{t('Copy URL')}</button>
              <button className="px-3 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => handleCopy(`![Badge](${badgeUrl})`, "Markdown")}>{t('Copy Markdown')}</button>
              <button className="px-3 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => handleCopy(`<img src=\"${badgeUrl}\" alt=\"badge\" />`, "HTML")}>{t('Copy HTML')}</button>
              <button className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleDownloadPNG}>{t('Download PNG')}</button>
              <button className="px-3 py-2 border rounded bg-white border-gray-300 text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 hover:shadow-sm active:bg-gray-100 active:scale-90 cursor-pointer transform ease-in-out" onClick={handleSaveHistory}>{t('Save to history')}</button>
            </div>

            <div className="mt-4">
              <h2 className="font-semibold">URL</h2>
              <code className="block p-2 bg-gray-100 rounded break-all mb-4">{badgeUrl}</code>

              <h2 className="font-semibold mt-2">Markdown</h2>
              <code className="block p-2 bg-gray-100 rounded break-all mb-4">{`![Badge](${badgeUrl})`}</code>

              <h2 className="font-semibold mt-2">HTML</h2>
              <code className="block p-2 bg-gray-100 rounded break-all">{`<img src="${badgeUrl}" alt="Badge" />`}</code>
            </div>
          </section>

          {/* Preview & History */}
          <aside className="space-y-4">
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-2">{t('Preview')}</h3>
              <BadgePreview url={badgeUrl} alt="badge preview" />
            </div>

            <div className="p-4 border rounded">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">{t('History')}</h3>
                <button className="text-xs px-2 py-1 border rounded bg-white border-gray-300 text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 hover:shadow-sm active:bg-gray-100 active:scale-90 cursor-pointer transform ease-in-out" onClick={handleClearHistory}>{t('Clear history')}</button>
              </div>

              {history.length === 0 ? (
                <div className="text-sm text-gray-500">{t('No history yet')}</div>
              ) : (
                <div className="flex flex-col gap-2 max-h-64 overflow-auto">
                  {history.map(entry => (
                    <div key={entry.id} className="flex items-center gap-2 justify-between border p-2 rounded">
                      <div className="flex flex-wrap items-center gap-2 max-w-[240px] cursor-pointer hover:scale-105 origin-left" onClick={() => handleLoadEntry(entry)}>
                        <img src={entry.url} alt="mini" className="h-6" />
                        <div className="text-xs">
                          <div className="font-medium">{entry.label} | {entry.message}</div>
                          <div className="text-gray-500">{entry.color}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="text-xs px-2 py-1 border rounded cursor-pointer hover:scale-105 origin-right" onClick={() => handleCopy(entry.url, "URL")}>Copy</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
      <Banner />
    </div>
  )
}
