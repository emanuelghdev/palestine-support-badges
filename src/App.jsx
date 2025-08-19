import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useStickyState from './hooks/useStickyState'
import LogoSelector, { getPresetLogoDataUrl } from './components/LogoSelector'
import BadgePreview from './components/BadgePreview'
import { svgUrlToPngDataUrl } from './utils/svgToPng'
import Banner from "./components/Banner";
import TooltipIcon from './components/TooltipIcon'


export default function App() {
  const { t, i18n } = useTranslation()

  // Estados persistidos con localStorage
  const [label, setLabel] = useStickyState('Free', 'badge_label')
  const [message, setMessage] = useStickyState('Palestine', 'badge_message')
  const [color, setColor] = useStickyState('#4cc71e', 'badge_color')
  const [selectedLogoId, setSelectedLogoId] = useStickyState('', 'badge_selected_logo_id')
  const [history, setHistory] = useStickyState([], 'badge_history')
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)
  const currentLang = (i18n.resolvedLanguage || i18n.language || localStorage.getItem('i18nextLng') || 'en').split('-')[0];

  // Inicializamos desde localStorage o desde la preferencia del sistema si no hay valor guardado
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('app:dark')
    if (saved !== null) return saved === 'true'

    // Fallback: usar preferencia del sistema
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Efecto que aplica la clase `dark` al root
  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) root.classList.add('dark')
    else root.classList.remove('dark')

    localStorage.setItem('app:dark', isDarkMode ? 'true' : 'false')
  }, [isDarkMode])

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

  // Manejamos la descarga del badge
  async function handleDownloadPNG() {
    try {
      const pngDataUrl = await svgUrlToPngDataUrl(badgeUrl)
      const a = document.createElement('a')
      a.href = pngDataUrl
      a.download = 'badge.png'
      a.click()
      setToast({ title: t('Export successful'), message: t('PNG downloaded'), type: 'Download', isError: false })
    } catch (err) {
      setToast({ title: t('Failed to export PNG'), message: err?.message ? String(err.message) : t('Unknown error'), type: 'Download', isError: true })
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

  // Manejamos guardar el historial
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

    setToast({ title: t('Saved!'), message: t('Badge stored successfully'), type: 'History', isError: false })

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

  // Manejamos cargar la entrada
  function handleLoadEntry(entry) {
    setLabel(entry.label)
    setMessage(entry.message)
    setColor(entry.color)
    setSelectedLogoId(entry.selectedLogoId || '')
  }

  // Manejamos limpiar el historial
  function handleClearHistory() {
    setHistory([])
    setToast({ title: t('Cleared!'), message: t('History deleted successfully'), type: 'Clear History', isError: false })

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

  // Manejamos la copia del badge
  async function handleCopy(text, type = 'Item') {
    try {
      await navigator.clipboard.writeText(text)
      setToast({ title: t('Copied!'), message: type + t(' copied to clipboard'), type, isError: false })
    } catch (e) {
      setToast({ title: t('Failed to copy'), message: t('Could not copy ') + type + t(' to clipboard'), type, isError: true })
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

  // Tabla de información del tooltip
  const tableInfo = (
    <div className="overflow-auto">
      <table className="min-w-[19rem] table-auto text-sm">
        <thead>
          <tr className="text-center text-s text-blue-600 dark:text-blue-400">
            <th className="px-2 py-1">{t('URL input')}</th>
            <th className="px-2 py-1">{t('Badge output')}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-gray-300">
            <td className="px-2 py-2 border-r border-gray-300">{t('Underscore')} <code className="font-mono bg-gray-100 px-1 rounded dark:bg-[#262b30]">_</code></td>
            <td className="px-2 py-2">{t('Space')} <code className="font-mono bg-gray-100 px-1 rounded dark:bg-[#262b30]">&nbsp;</code></td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="px-2 py-2 border-r border-gray-300">{t('Double underscore')} <code className="font-mono bg-gray-100 px-1 rounded dark:bg-[#262b30]">__</code></td>
            <td className="px-2 py-2">{t('Underscore')} <code className="font-mono bg-gray-100 px-1 rounded dark:bg-[#262b30]">_</code></td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="px-2 py-2 border-r border-gray-300">{t('Double dash')} <code className="font-mono bg-gray-100 px-1 rounded dark:bg-[#262b30]">--</code></td>
            <td className="px-2 py-2">{t('Dash')} <code className="font-mono bg-gray-100 px-1 rounded dark:bg-[#262b30]">-</code></td>
          </tr>
        </tbody>
      </table>
    </div>
  )


  return (
    <div className="min-h-screen bg-gray-50 p-6 inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808014_1px,transparent_1px),linear-gradient(to_bottom,#80808014_1px,transparent_1px)] bg-[size:14px_24px] dark:bg-[#1A1A1A] dark:text-white">
      {toast && (
        <div className="fixed bottom-10 right-10 z-50">
            {/* Variar colores del alert según toast.type */}
            <div role="alert" className={"toast-pop flex align-middle" +
              (
                toast.type === 'URL'
                ? "flex items-center p-4 mb-4 text-sm text-sky-800 border border-sky-300 rounded-lg bg-sky-50 dark:bg-gray-900 dark:text-sky-400"
                : toast.type === 'Markdown'
                ? "flex items-center p-4 mb-4 text-sm text-rose-800 border border-rose-300 rounded-lg bg-rose-50 dark:bg-gray-900 dark:text-rose-400"
                : toast.type === 'HTML'
                ? "flex items-center p-4 mb-4 text-sm text-emerald-800 border border-emerald-300 rounded-lg bg-emerald-50 dark:bg-gray-900 dark:text-emerald-400"
                : toast.type === 'History'
                ? "flex items-center p-4 mb-4 text-sm text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-900 dark:text-yellow-400"
                : toast.type === 'Download'
                ? "flex items-center p-4 mb-4 text-sm text-indigo-800 border border-indigo-300 rounded-lg bg-indigo-50 dark:bg-gray-900 dark:text-indigo-300"
                : toast.type === 'Clear History'
                ? "flex items-center p-4 mb-4 text-sm text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
                : // Fallback
                  (toast.isError ? "flex items-center p-4 mb-4 text-sm dark:bg-gray-900  text-white rounded-lg bg-red-600" : "flex items-center p-4 mb-4 text-sm dark:bg-gray-900  text-white rounded-lg bg-gray-600")
              )}>
              <svg className="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <span className="font-medium mr-2">{toast.title}</span>
              <span>{toast.message}</span>
            </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow dark:bg-[#202529]">
        <header className="flex flex-col mb-4 md:flex-row items-start md:items-center justify-between md:mb-12 gap-4 md:gap-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r to-[#E4312b] from-[#149954]">Palestine Support</span> Badges
          </h1>

          <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-6">
            {/* Toggle de modo oscuro */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative rounded-full w-14 h-8 flex items-center justify-center border transition-colors duration-300 ease-in-out focus:outline-none cursor-pointer ${
                  isDarkMode ? 'bg-[#262626] hover:bg-[#222222] border-[#333333]' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
                aria-label="Toggle dark mode"
              >
                <span className="sr-only">Toggle dark mode</span>
                <span 
                  className={`absolute left-1 top-1 bg-white rounded-full w-6 h-6 flex items-center justify-center transform transition-transform duration-300 ease-in-out ${
                    isDarkMode ? 'translate-x-6' : ''
                  }`}
                >
                  {isDarkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-900" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </button>
            </div>

            {/* Selector de idioma */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>

              <select
                value={currentLang}
                onChange={e => i18n.changeLanguage(e.target.value)}
                className="w-full pl-10 pr-12 py-2 text-base font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-full appearance-none focus:outline-none focus:ring-1 focus:border-black transition-all duration-200 hover:bg-gray-100 cursor-pointer dark:bg-[#262626] dark:border-[#333333] dark:text-white hover:dark:bg-[#222222]">
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-50">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-col-reverse md:grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <section className="col-span-2 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t('Label')}</span>
                <input className="border border-gray-300 rounded p-2" value={label} onChange={e => setLabel(e.target.value)} />
              </label>

              <label className="flex flex-col gap-2">
                <span className="flex flex-row items-center text-sm font-medium">
                  {t('Message')}
                  <TooltipIcon content={tableInfo}/>
                </span>
                <input className="border border-gray-300 rounded p-2" value={message} onChange={e => setMessage(e.target.value)} />
              </label>
            </div>

            <div className="flex flex-col md:flex-row content-start items-start gap-4 mb-8">
              <div className="w-full md:w-auto">
                <label className="text-sm font-medium">{t('Color')}</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={color.startsWith('#') ? color : `#${color}`} onChange={e => setColor(e.target.value)} />
                  <input className="w-[90%] md:w-auto border border-gray-300 rounded h-10 p-2" value={color} onChange={e => setColor(e.target.value)} />
                </div>
              </div>

              <div>
                <LogoSelector selectedId={selectedLogoId} onSelect={setSelectedLogoId} />
              </div>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <button className="w-full sm:w-auto px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => handleCopy(badgeUrl, "URL")}>{t('Copy URL')}</button>
              <button className="w-full sm:w-auto px-3 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => handleCopy(`![Badge](${badgeUrl})`, "Markdown")}>{t('Copy Markdown')}</button>
              <button className="w-full sm:w-auto px-3 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => handleCopy(`<img src=\"${badgeUrl}\" alt=\"badge\" />`, "HTML")}>{t('Copy HTML')}</button>
              <button className="w-full sm:w-auto px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleDownloadPNG}>{t('Download PNG')}</button>
              <button className="w-full sm:w-auto px-3 py-2 border rounded bg-white border-gray-300 text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 hover:shadow-sm active:bg-gray-100 active:scale-90 cursor-pointer transform ease-in-out dark:bg-[#202529] dark:border-[#3a3f44] dark:text-gray-200 dark:hover:bg-[#2a2f33] dark:hover:border-[#4a4f55] dark:hover:text-gray-100" onClick={handleSaveHistory}>{t('Save to history')}</button>
            </div>

            <div className="hidden md:block mt-4">
              <h2 className="font-semibold mb-0.5">URL</h2>
              <code className="block p-2 font-mono bg-gray-100 rounded break-all mb-4 dark:bg-[#262b30]">{badgeUrl}</code>

              <h2 className="font-semibold mt-2 mb-0.5">Markdown</h2>
              <code className="block p-2 font-mono bg-gray-100 rounded break-all mb-4 dark:bg-[#262b30]">{`![Badge](${badgeUrl})`}</code>

              <h2 className="font-semibold mt-2 mb-0.5">HTML</h2>
              <code className="block p-2 font-mono bg-gray-100 rounded break-all dark:bg-[#262b30]">{`<img src="${badgeUrl}" alt="Badge" />`}</code>
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
                <button className="text-xs px-2 py-1 border rounded bg-white border-gray-300 text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 hover:shadow-sm active:bg-gray-100 active:scale-90 cursor-pointer transform ease-in-out dark:bg-[#202529] dark:border-[#3a3f44] dark:text-gray-200 dark:hover:bg-[#2a2f33] dark:hover:border-[#4a4f55] dark:hover:text-gray-100" onClick={handleClearHistory}>{t('Clear history')}</button>
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
                        <button className="text-xs px-2 py-1 border rounded cursor-pointer hover:scale-105 origin-right" onClick={() => handleCopy(entry.url, "URL")}>{t('Copy')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
      <Banner isDarkMode = {isDarkMode}/>
    </div>
  )
}
