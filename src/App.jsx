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
  const [color, setColor] = useStickyState('#00b03f', 'badge_color')
  const [selectedLogoId, setSelectedLogoId] = useStickyState('logo1', 'badge_selected_logo_id')
  const [history, setHistory] = useStickyState([], 'badge_history')
  const [toast, setToast] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        <header className="flex flex-row mb-8 items-center justify-between md:mb-12 gap-4 md:gap-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r to-[#E4312b] from-[#149954]">Palestine Support</span> Badges
          </h1>

          <div className="flex w-fit md:w-auto items-center justify-between md:justify-end gap-5">
            {/* Drawer button */}
            <div className="flex justify-end md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-controls="mobile-menu" aria-expanded={isMenuOpen} className="rounded-md text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition duration-200 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg"  width="27"  height="27"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6h16" /><path d="M7 12h13" /><path d="M10 18h10" />
                    </svg>
                </button>
            </div>

            {/* Toggles */}
            <div className="hidden md:flex items-center gap-4 pr-5 border-r-1 border-r-black/25 dark:border-r-gray-200/25">
              {/* Toggle de modo oscuro/claro */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`relative rounded-full w-14 h-8 flex items-center justify-center border transition-colors duration-300 ease-in-out focus:outline-none cursor-pointer ${
                    isDarkMode ? 'bg-[#262626] hover:bg-[#222222] border-[#333333]' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                  aria-label={t('Toggle dark mode')}
                >
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
                  className="w-full h-9 pl-10 pr-12 py-1 text-base font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-full appearance-none focus:outline-none focus:ring-1 focus:border-black transition-all duration-200 hover:bg-gray-100 cursor-pointer dark:bg-[#262626] dark:border-[#333333] dark:text-white hover:dark:bg-[#222222]"
                  aria-label={t('Language selector')}
                >
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

            {/* Enlaces */}
            <div className="hidden md:flex items-center gap-6">
              {/* Enlace a GitHub */}
              <div className="flex gap-x-2 cursor-pointer">
                <a href="https://github.com/emanuelghdev/palestine-support-badges" target="_blank" rel="noopener noreferrer" role="link" className="flex items-center opacity-80 transition-opacity hover:opacity-100" title={t('Go to the GitHub project')} aria-label={t('Go to the GitHub project')}>
                  <svg viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" fill="currentColor"/>
                  </svg>
                </a>
              </div>

              {/* Enlace a Discord */}
              <div className="hidden md:flex gap-x-2 cursor-pointer">
                <a href="https://discord.com/channels/1186702814341234740/1413517051347337370" target="_blank" rel="noopener noreferrer" role="link" className="flex items-center opacity-80 transition-opacity hover:opacity-100" title={t('Go to the Discord')} aria-label={t('Go to the Discord')}>
                  <svg  viewBox="0 0 256 199" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" className="h-7 w-7">
                    <path d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z" fill="#5865F2"/></svg>
                </a>
              </div>

              {/* Enlace a Tech4Palestine */}
              <div className="hidden md:flex gap-x-2 cursor-pointer">
                <a href="https://techforpalestine.org/" target="_blank" rel="noopener noreferrer" role="link" className="flex items-center opacity-80 dark:opacity-75 transition-opacity hover:opacity-100" title={t('Go to Tech For Palestine')} aria-label={t('Go to Tech For Palestine')}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" className="h-8 w-8">
                    <path d="M459 108h163c0 58.665-9.906 115.34-28.822 170.817-.648 1.902-1.285 3.808-1.922 5.713C590 288 590 288 588.574 290.962c-1.883 4.025-2.962 6.597-1.78 10.985 1.521 3.294 3.253 6.331 5.144 9.428l1.972 3.424c1.981 3.43 4.033 6.815 6.09 10.201 1.14 1.92 2.28 3.84 3.418 5.762C617.415 354.079 633.858 375.759 652 396l1.474 1.65c6.07 6.761 12.367 13.285 18.776 19.725l1.968 1.982c4.431 4.416 9.042 8.562 13.782 12.643 1.048.926 2.095 1.853 3.14 2.781 25.615 22.512 54.397 40.59 84.282 56.813l2.456 1.334c3.231 1.633 4.575 2.228 8.14 1.21l3.728-1.384 4.182-1.527 2.226-.823C853.986 469.09 911.465 460.81 973 459v163c-10.965 0-21.717-.023-32.625-.75l-1.968-.131c-50.734-3.448-102.884-13.356-149.977-33.006-5.51-1.788-8.84-.49-13.871 1.934a451.26 451.26 0 0 0-5.121 2.703l-2.779 1.475C745.972 605.36 726.423 618.443 708 633l-2.535 1.98c-18.32 14.448-36.472 30.205-51.668 47.946-1.972 2.276-4.008 4.483-6.047 6.699-5.06 5.617-9.713 11.51-14.313 17.505a695.642 695.642 0 0 1-2.854 3.689c-13.705 17.59-25.635 36.42-36.358 55.957a428.005 428.005 0 0 1-3.334 5.92l-1.703 3.116-1.395 2.52c-1.946 6.548.79 12.803 3.207 18.856 17.707 46.42 27.234 95.8 30.25 145.312l.243 3.987c.502 9.208.507 18.262.507 27.513H459c0-59.708 9.95-118.453 30.102-174.67l.763-2.143c.681-1.909 1.372-3.814 2.063-5.719 2.034-6.464 2.034-6.464 1.29-13.04l-1.288-2.405-1.447-2.748-1.608-2.9-1.65-3.058C469.864 735.557 448.446 706.628 424 680l-1.542-1.695c-7.652-8.4-15.508-16.403-23.978-23.978a505.418 505.418 0 0 1-4.164-3.788C378.236 635.838 360.398 622.662 342 611l-2.035-1.294c-9.072-5.736-18.327-11.128-27.715-16.331l-2.815-1.58-2.67-1.46-2.35-1.294c-5.831-2.513-9.545-2.017-15.419.205l-4.138 1.527-2.182.823c-3.818 1.435-7.656 2.815-11.496 4.19l-2.353.841C217.619 614.773 162.107 622 108 622V460c33.779 0 33.779 0 45.75 1.188l2.09.197c44.713 4.247 87.782 14.538 130.117 29.513l3.24 1.109c2.188.775 4.336 1.666 6.463 2.598 5.461.646 9.295-2.037 13.965-4.668l3.05-1.657c29.571-16.28 57.707-35.8 82.524-58.725a290.122 290.122 0 0 1 6.504-5.739c5.004-4.366 9.676-9.049 14.36-13.753l2.603-2.592c4.987-4.995 9.757-10.1 14.334-15.471l2.563-2.922c22.034-25.565 39.969-53.91 56.03-83.5l1.335-2.456c1.839-3.555 1.839-3.555 1.426-7.402l-1.092-2.724-1.221-3.128-1.353-3.43C469.065 229.612 459 168.7 459 108Zm81 277a233.547 233.547 0 0 0-3.938 6.125C525.856 407.238 514.23 422.375 502 437l-1.334 1.596c-10.934 13.033-22.538 25.352-34.541 37.404l-2.377 2.391c-4.756 4.743-9.653 9.236-14.748 13.609a1422.305 1422.305 0 0 0-3.465 3.07C436.354 503.172 426.82 510.69 417 518l-1.954 1.46c-5.772 4.31-11.572 8.56-17.538 12.599l-2.248 1.523c-1.44.97-2.885 1.934-4.334 2.891-1.677 1.126-3.307 2.32-4.926 3.527v2c1.399 1.19 1.399 1.19 3.27 2.328l2.165 1.403 2.377 1.519c13.979 9.123 27.444 18.964 40.188 29.75 1.03.857 2.062 1.714 3.094 2.57 7.267 6.057 14.274 12.352 21.177 18.82a791.98 791.98 0 0 0 5.495 5.06A315.24 315.24 0 0 1 486 626c.932 1.011 1.867 2.02 2.805 3.027A339.968 339.968 0 0 1 506 649l1.248 1.552c11.72 14.58 22.523 29.792 32.752 45.448 3.848-4.625 7.208-9.556 10.625-14.5 5.578-8.019 11.308-15.844 17.375-23.5l2.004-2.555a495.776 495.776 0 0 1 25.383-29.613 509.11 509.11 0 0 0 7.05-7.832c7.03-7.823 14.437-15.35 22.45-22.168 2.17-1.88 4.277-3.82 6.381-5.774A315.668 315.668 0 0 1 650 574l1.913-1.526C666.043 561.218 680.57 550.422 696 541c-3.893-3.212-7.947-6.056-12.125-8.875-13.103-8.942-25.961-18.19-37.945-28.598-2.887-2.49-5.833-4.889-8.805-7.277-3.671-2.986-7.077-6.068-10.353-9.48-1.72-1.717-3.498-3.287-5.35-4.86-5.053-4.392-9.763-9.105-14.485-13.848l-2.603-2.591c-4.988-4.996-9.749-10.106-14.334-15.471a1719.086 1719.086 0 0 0-3.14-3.57c-7.245-8.263-14.219-16.675-20.86-25.43l-1.66-2.188c-7.062-9.347-13.828-18.805-20.053-28.733A280.263 280.263 0 0 0 541 385h-1Z"/><path fill="#257F23" d="M388 542a112.144 112.144 0 0 1 7.125 4.688l2.085 1.462A839.708 839.708 0 0 1 404 553l2.423 1.746C415.847 561.562 425.12 568.485 434 576c1.03.857 2.062 1.714 3.094 2.57 7.269 6.058 14.277 12.355 21.182 18.824a755.911 755.911 0 0 0 5.454 5.02c7.663 7.028 14.91 14.276 21.853 22.016a400.593 400.593 0 0 0 4.288 4.664A338.361 338.361 0 0 1 507 649l1.248 1.552C519.497 664.545 529.869 679.184 540 694c2.975-2.8 5.186-5.62 7.375-9.063C555.804 672.082 565.068 659.731 575 648a3975.14 3975.14 0 0 0 2.605-3.129 488.382 488.382 0 0 1 16.786-19.043 488.73 488.73 0 0 0 6.984-7.765c7.364-8.198 15.141-16.132 23.547-23.266 2.159-1.867 4.253-3.795 6.344-5.737A315.484 315.484 0 0 1 650 573l1.913-1.526a549.422 549.422 0 0 1 34.03-25.053 82.75 82.75 0 0 0 3.754-2.74c2.61-1.98 4.012-2.685 7.33-2.638 3.26 1.05 5.673 2.389 8.535 4.27a814.6 814.6 0 0 0 3.454 2.19l1.916 1.212c20.241 12.573 41.525 23.379 63.667 32.164l2.897 1.16 2.568 1.006C782 584 782 584 783 586l-1.962.987C755.135 600.082 730.78 615 708 633l-2.535 1.98c-18.32 14.448-36.472 30.205-51.668 47.946-1.972 2.276-4.008 4.483-6.047 6.699-5.06 5.617-9.713 11.51-14.313 17.505a695.642 695.642 0 0 1-2.854 3.689c-13.705 17.59-25.635 36.42-36.358 55.957a428.005 428.005 0 0 1-3.334 5.92l-1.703 3.116-1.395 2.52c-1.946 6.548.79 12.803 3.207 18.856 17.707 46.42 27.234 95.8 30.25 145.312l.243 3.987c.502 9.208.507 18.262.507 27.513H459c0-59.708 9.95-118.453 30.102-174.67l.763-2.143c.681-1.909 1.372-3.814 2.063-5.719 2.034-6.464 2.034-6.464 1.29-13.04l-1.288-2.405-1.447-2.748-1.608-2.9c-.545-1.01-1.09-2.018-1.65-3.058-17.36-31.76-38.778-60.689-63.225-87.317l-1.542-1.695c-7.652-8.4-15.508-16.403-23.978-23.978a505.418 505.418 0 0 1-4.164-3.788C378.236 635.838 360.398 622.662 342 611l-2.035-1.294c-10.013-6.33-20.254-12.159-30.705-17.735l-2.69-1.44-2.382-1.263c-2.204-1.277-4.184-2.7-6.188-4.268l5-2.313 3.617-1.675a915.68 915.68 0 0 1 9.64-4.367c20.736-9.316 41.298-19.131 60.21-31.822l2.4-1.57 2.066-1.395c2.757-1.145 4.25-.74 7.067.142Z"/><path fill="#E3302A" d="M495 299h2l.835 1.93c10.872 25.062 21.883 50.207 36.802 73.191l1.163 1.802a265.28 265.28 0 0 0 3.005 4.456c1.618 3.55 1.44 4.906.195 8.621-1.88 3.256-4.04 6.274-6.25 9.313l-1.897 2.656C521.99 413.3 512.773 425.375 503 437l-1.321 1.579c-11.091 13.222-22.876 25.696-35.054 37.921l-2.521 2.536A271.49 271.49 0 0 1 449 493a1362.151 1362.151 0 0 0-3.465 3.07C436.354 504.172 426.82 511.69 417 519l-1.954 1.46c-25.032 18.69-25.032 18.69-36.987 24.907-3.194 1.705-6.305 3.519-9.423 5.355C348.702 562.442 328.078 572.515 307 582l-2.377 1.083c-44.375 20.064-93.25 31.175-141.56 36.23-.777.08-1.553.162-2.353.246C143.11 621.373 125.744 622 108 622V460c33.779 0 33.779 0 45.75 1.188l2.09.197c44.713 4.247 87.782 14.538 130.117 29.513l3.24 1.109c2.188.775 4.336 1.666 6.463 2.598 5.461.646 9.295-2.037 13.965-4.668l3.05-1.657c29.571-16.28 57.707-35.8 82.524-58.725a290.122 290.122 0 0 1 6.504-5.739c5.004-4.366 9.676-9.049 14.36-13.753l2.603-2.592c4.987-4.995 9.757-10.1 14.334-15.471l2.563-2.922C459.04 361.838 478.921 331.157 495 299Z"/><path d="M388 542a112.144 112.144 0 0 1 7.125 4.688l2.085 1.462A839.708 839.708 0 0 1 404 553l2.423 1.746C415.847 561.562 425.12 568.485 434 576c1.03.857 2.062 1.714 3.094 2.57 7.269 6.058 14.277 12.355 21.182 18.824a755.911 755.911 0 0 0 5.454 5.02c7.663 7.028 14.91 14.276 21.853 22.016a400.593 400.593 0 0 0 4.288 4.664A338.361 338.361 0 0 1 507 649l1.248 1.552c7.401 9.207 14.384 18.687 21.223 28.318a342.15 342.15 0 0 0 4.388 5.954c.84 1.142 1.678 2.284 2.516 3.426l2.21 2.953C540 694 540 694 540.056 696.805c-1.472 4.457-3.803 8.118-6.305 12.07C519.158 732.63 507.239 757.528 496 783c-2.072-2.643-3.742-5.244-5.242-8.246l-1.27-2.504-1.363-2.688C471.17 736.745 448.93 707.154 424 680l-1.542-1.695c-7.652-8.4-15.508-16.403-23.978-23.978a505.418 505.418 0 0 1-4.164-3.788C378.236 635.838 360.398 622.662 342 611l-2.035-1.294c-10.013-6.33-20.254-12.159-30.705-17.735l-2.69-1.44-2.382-1.263c-2.204-1.277-4.184-2.7-6.188-4.268l5-2.313 3.617-1.675a915.68 915.68 0 0 1 9.64-4.367c20.736-9.316 41.298-19.131 60.21-31.822l2.4-1.57 2.066-1.395c2.757-1.145 4.25-.74 7.067.142ZM585 783c27.857 41.785 33.249 110.233 36.25 159.5l.243 3.987c.502 9.208.507 18.262.507 27.513h-81c0-34.852 0-34.852 1.188-45.063l.405-3.703C548.164 876.822 560.837 825.71 585 783ZM973 541v81c-10.965 0-21.717-.023-32.625-.75l-1.968-.131C885.494 617.523 832.048 606.507 783 586c3.118-3.353 6.78-5.076 10.875-7l2.48-1.167c17.723-8.141 36.265-14.944 55.067-20.116 2.804-.78 5.595-1.6 8.387-2.42 22.73-6.547 46-10.636 69.504-13.172l3.2-.364C946.04 540.463 959.303 541 973 541Z"/><path fill="#257F23" d="M973 459v81c-20.523 0-39.844-.205-60-3l-2.2-.293c-12.87-1.725-25.392-4.252-37.987-7.394l-2.679-.66C852.041 524.188 834.253 519.109 817 512l-2.323-.953C803.985 506.637 793.433 501.99 783 497v-2c61.712-22.47 124.12-36 190-36Z"/><path fill="#E3302A" d="M541 108h81c0 64.534-11.011 130.232-36 190h-2c-20.936-45.146-35.254-91.427-41-141l-.36-3.089C540.924 138.552 541 123.543 541 108Z"/><path d="M459 108h81c0 42.182-4.15 83.545-17.286 123.757-.541 1.7-1.062 3.407-1.574 5.117-2.484 8.284-5.36 16.363-8.452 24.439l-.728 1.91c-4.508 11.823-9.236 23.482-14.96 34.777h-2c-23.786-60.741-36-124.734-36-190ZM108 460c33.779 0 33.779 0 45.75 1.188l2.09.197c47.064 4.47 99.885 12.7 142.16 34.615-4.935 3.996-10.7 6.093-16.5 8.563l-1.863.795C259.255 514.033 238.427 521.366 217 527l-2.48.667c-18.36 4.917-36.783 8.192-55.663 10.31-1.562.176-3.124.357-4.686.543C138.658 540.342 123.8 540 108 540v-80Z"/><path fill="#2E0A09" d="M540 108h1l.028 1.752c.854 43.343 6.533 85.956 19.972 127.248l1.781 5.625A398.7 398.7 0 0 0 571.875 268l.962 2.495c1.736 4.39 3.652 8.448 6.058 12.513 6.743 11.94 6.743 11.94 5.626 19.032-2.082 6.93-5.328 13.262-8.742 19.62-1.743 3.273-3.36 6.58-4.947 9.93-7.139 14.94-15.3 29.23-23.832 43.41l-3.41 5.688L541 385c-2.732-3.294-5.067-6.597-7.215-10.297l-1.81-3.115c-.63-1.102-1.262-2.203-1.913-3.338l-.993-1.73c-11.166-19.483-21.551-39.324-30.063-60.127-1.023-2.536-1.023-2.536-2.611-5.409-.693-5.236 2.166-9.453 4.48-14.046 1.035-2.149 2.065-4.3 3.09-6.454l1.562-3.279c3.308-7.198 5.988-14.649 8.698-22.089a326.536 326.536 0 0 1 1.978-5.233c2.912-7.603 4.971-15.44 7.078-23.296a252.963 252.963 0 0 1 1.623-5.575c3.067-10.238 5.179-20.58 7.159-31.075l.53-2.797c4.952-26.32 6.912-52.4 7.407-79.14Z"/><path fill="#081A07" d="m786.16 497.492 2.372 1.125 2.53 1.258c1.806.854 3.614 1.704 5.422 2.55l2.787 1.316c22.301 10.292 45.763 17.656 69.574 23.482 2.867.706 5.727 1.44 8.585 2.183 14.031 3.59 28.21 5.769 42.57 7.594l2.732.348c16.68 2.034 33.486 2.265 50.268 2.652v1l-2.186.044c-37.297.83-74.854 4.541-110.814 14.956l-3.193.917c-20.178 5.86-40.67 12.298-59.432 21.888l-2.587 1.314a122.282 122.282 0 0 0-4.58 2.504c-4.034 2.13-6.536 2.667-10.985 1.436A121.465 121.465 0 0 1 774 582l-2.795-1.161a336.274 336.274 0 0 1-9.143-4.152l-3.407-1.59C737.038 564.91 716.309 553.565 696 541c24.014-18.406 53.323-31.101 81-43l2.637-1.266c2.9-.9 3.835-.564 6.523.758Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Overlay Movil */}
        {isMenuOpen && (
          <aside className="md:hidden fixed inset-0 z-50 backdrop-brightness-50" onClick={() => setIsMenuOpen(false)}>
            <div className="absolute top-0 right-0 w-72 h-full bg-white dark:bg-[#202529] shadow-lg p-6" onClick={e => e.stopPropagation()}>
              {/* Botón de cierre */}
              <div className="flex justify-end mb-10">
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition duration-200 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Toggles Movil */}
              <div className="space-y-6 mb-8">
                {/* Toggle de modo oscuro/claro */}
                <div className="flex items-center justify-between">
                  <span className="text-black dark:text-white">{t('Theme')}</span>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`relative rounded-full w-14 h-8 flex items-center justify-center border transition-colors duration-300 ease-in-out focus:outline-none cursor-pointer ${ isDarkMode ? 'bg-[#262626] hover:bg-[#222222] border-[#333333]' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}
                    aria-label={t('Toggle dark mode')}
                  >
                    <span className={`absolute left-1 top-1 bg-white rounded-full w-6 h-6 flex items-center justify-center transform transition-transform duration-300 ease-in-out ${isDarkMode ? 'translate-x-6' : ''}`}>
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
                <div className="flex items-center justify-between">
                  <span className="text-black dark:text-white">{t('Language')}</span>
                  <div className="relative">
                    <select
                      value={currentLang}
                      onChange={e => i18n.changeLanguage(e.target.value)}
                      className="w-full h-9 pl-5 pr-8 py-1 text-base font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-full appearance-none focus:outline-none focus:ring-1 focus:border-black transition-all duration-200 hover:bg-gray-100 cursor-pointer dark:bg-[#262626] dark:border-[#333333] dark:text-white hover:dark:bg-[#222222]"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-50">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enlaces Movil */}
              <div className="space-y-4 pt-4 border-t-1 border-t-black/25 dark:border-t-gray-200/25">
                {/* Enlace a GitHub */}
                <a href="https://github.com/emanuelghdev/palestine-support-badges" target="_blank" rel="noopener noreferrer" role="link" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#4d515480] transition-all duration-50 group" onClick={() => setIsMenuOpen(false)} aria-label={t('Go to the GitHub project')}>
                  <svg viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" fill="currentColor"/>
                  </svg>
                  <span className="text-black dark:text-white group-hover:underline">{t('Source Code')}</span>
                </a>

                {/* Enlace a Discord */}
                <a href="https://discord.com/channels/1186702814341234740/1413517051347337370" target="_blank" rel="noopener noreferrer" role="link" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#4d515480] transition-all duration-50 group" onClick={() => setIsMenuOpen(false)} aria-label={t('Go to the Discord')}>
                  <svg viewBox="0 0 256 199" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" className="h-7 w-7">
                    <path d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z" fill="#5865F2"/>
                  </svg>
                  <span className="text-black dark:text-white group-hover:underline">{t('Discord Community')}</span>
                </a>

                {/* Enlace a Tech For Palestine */}
                <a href="https://techforpalestine.org/" target="_blank" rel="noopener noreferrer" role="link" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#4d515480] transition-all duration-50 group" onClick={() => setIsMenuOpen(false)} aria-label={t('Go to Tech For Palestine')}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" className="h-8 w-7">
                    <path d="M459 108h163c0 58.665-9.906 115.34-28.822 170.817-.648 1.902-1.285 3.808-1.922 5.713C590 288 590 288 588.574 290.962c-1.883 4.025-2.962 6.597-1.78 10.985 1.521 3.294 3.253 6.331 5.144 9.428l1.972 3.424c1.981 3.43 4.033 6.815 6.09 10.201 1.14 1.92 2.28 3.84 3.418 5.762C617.415 354.079 633.858 375.759 652 396l1.474 1.65c6.07 6.761 12.367 13.285 18.776 19.725l1.968 1.982c4.431 4.416 9.042 8.562 13.782 12.643 1.048.926 2.095 1.853 3.14 2.781 25.615 22.512 54.397 40.59 84.282 56.813l2.456 1.334c3.231 1.633 4.575 2.228 8.14 1.21l3.728-1.384 4.182-1.527 2.226-.823C853.986 469.09 911.465 460.81 973 459v163c-10.965 0-21.717-.023-32.625-.75l-1.968-.131c-50.734-3.448-102.884-13.356-149.977-33.006-5.51-1.788-8.84-.49-13.871 1.934a451.26 451.26 0 0 0-5.121 2.703l-2.779 1.475C745.972 605.36 726.423 618.443 708 633l-2.535 1.98c-18.32 14.448-36.472 30.205-51.668 47.946-1.972 2.276-4.008 4.483-6.047 6.699-5.06 5.617-9.713 11.51-14.313 17.505a695.642 695.642 0 0 1-2.854 3.689c-13.705 17.59-25.635 36.42-36.358 55.957a428.005 428.005 0 0 1-3.334 5.92l-1.703 3.116-1.395 2.52c-1.946 6.548.79 12.803 3.207 18.856 17.707 46.42 27.234 95.8 30.25 145.312l.243 3.987c.502 9.208.507 18.262.507 27.513H459c0-59.708 9.95-118.453 30.102-174.67l.763-2.143c.681-1.909 1.372-3.814 2.063-5.719 2.034-6.464 2.034-6.464 1.29-13.04l-1.288-2.405-1.447-2.748-1.608-2.9-1.65-3.058C469.864 735.557 448.446 706.628 424 680l-1.542-1.695c-7.652-8.4-15.508-16.403-23.978-23.978a505.418 505.418 0 0 1-4.164-3.788C378.236 635.838 360.398 622.662 342 611l-2.035-1.294c-9.072-5.736-18.327-11.128-27.715-16.331l-2.815-1.58-2.67-1.46-2.35-1.294c-5.831-2.513-9.545-2.017-15.419.205l-4.138 1.527-2.182.823c-3.818 1.435-7.656 2.815-11.496 4.19l-2.353.841C217.619 614.773 162.107 622 108 622V460c33.779 0 33.779 0 45.75 1.188l2.09.197c44.713 4.247 87.782 14.538 130.117 29.513l3.24 1.109c2.188.775 4.336 1.666 6.463 2.598 5.461.646 9.295-2.037 13.965-4.668l3.05-1.657c29.571-16.28 57.707-35.8 82.524-58.725a290.122 290.122 0 0 1 6.504-5.739c5.004-4.366 9.676-9.049 14.36-13.753l2.603-2.592c4.987-4.995 9.757-10.1 14.334-15.471l2.563-2.922c22.034-25.565 39.969-53.91 56.03-83.5l1.335-2.456c1.839-3.555 1.839-3.555 1.426-7.402l-1.092-2.724-1.221-3.128-1.353-3.43C469.065 229.612 459 168.7 459 108Zm81 277a233.547 233.547 0 0 0-3.938 6.125C525.856 407.238 514.23 422.375 502 437l-1.334 1.596c-10.934 13.033-22.538 25.352-34.541 37.404l-2.377 2.391c-4.756 4.743-9.653 9.236-14.748 13.609a1422.305 1422.305 0 0 0-3.465 3.07C436.354 503.172 426.82 510.69 417 518l-1.954 1.46c-5.772 4.31-11.572 8.56-17.538 12.599l-2.248 1.523c-1.44.97-2.885 1.934-4.334 2.891-1.677 1.126-3.307 2.32-4.926 3.527v2c1.399 1.19 1.399 1.19 3.27 2.328l2.165 1.403 2.377 1.519c13.979 9.123 27.444 18.964 40.188 29.75 1.03.857 2.062 1.714 3.094 2.57 7.267 6.057 14.274 12.352 21.177 18.82a791.98 791.98 0 0 0 5.495 5.06A315.24 315.24 0 0 1 486 626c.932 1.011 1.867 2.02 2.805 3.027A339.968 339.968 0 0 1 506 649l1.248 1.552c11.72 14.58 22.523 29.792 32.752 45.448 3.848-4.625 7.208-9.556 10.625-14.5 5.578-8.019 11.308-15.844 17.375-23.5l2.004-2.555a495.776 495.776 0 0 1 25.383-29.613 509.11 509.11 0 0 0 7.05-7.832c7.03-7.823 14.437-15.35 22.45-22.168 2.17-1.88 4.277-3.82 6.381-5.774A315.668 315.668 0 0 1 650 574l1.913-1.526C666.043 561.218 680.57 550.422 696 541c-3.893-3.212-7.947-6.056-12.125-8.875-13.103-8.942-25.961-18.19-37.945-28.598-2.887-2.49-5.833-4.889-8.805-7.277-3.671-2.986-7.077-6.068-10.353-9.48-1.72-1.717-3.498-3.287-5.35-4.86-5.053-4.392-9.763-9.105-14.485-13.848l-2.603-2.591c-4.988-4.996-9.749-10.106-14.334-15.471a1719.086 1719.086 0 0 0-3.14-3.57c-7.245-8.263-14.219-16.675-20.86-25.43l-1.66-2.188c-7.062-9.347-13.828-18.805-20.053-28.733A280.263 280.263 0 0 0 541 385h-1Z"/><path fill="#257F23" d="M388 542a112.144 112.144 0 0 1 7.125 4.688l2.085 1.462A839.708 839.708 0 0 1 404 553l2.423 1.746C415.847 561.562 425.12 568.485 434 576c1.03.857 2.062 1.714 3.094 2.57 7.269 6.058 14.277 12.355 21.182 18.824a755.911 755.911 0 0 0 5.454 5.02c7.663 7.028 14.91 14.276 21.853 22.016a400.593 400.593 0 0 0 4.288 4.664A338.361 338.361 0 0 1 507 649l1.248 1.552C519.497 664.545 529.869 679.184 540 694c2.975-2.8 5.186-5.62 7.375-9.063C555.804 672.082 565.068 659.731 575 648a3975.14 3975.14 0 0 0 2.605-3.129 488.382 488.382 0 0 1 16.786-19.043 488.73 488.73 0 0 0 6.984-7.765c7.364-8.198 15.141-16.132 23.547-23.266 2.159-1.867 4.253-3.795 6.344-5.737A315.484 315.484 0 0 1 650 573l1.913-1.526a549.422 549.422 0 0 1 34.03-25.053 82.75 82.75 0 0 0 3.754-2.74c2.61-1.98 4.012-2.685 7.33-2.638 3.26 1.05 5.673 2.389 8.535 4.27a814.6 814.6 0 0 0 3.454 2.19l1.916 1.212c20.241 12.573 41.525 23.379 63.667 32.164l2.897 1.16 2.568 1.006C782 584 782 584 783 586l-1.962.987C755.135 600.082 730.78 615 708 633l-2.535 1.98c-18.32 14.448-36.472 30.205-51.668 47.946-1.972 2.276-4.008 4.483-6.047 6.699-5.06 5.617-9.713 11.51-14.313 17.505a695.642 695.642 0 0 1-2.854 3.689c-13.705 17.59-25.635 36.42-36.358 55.957a428.005 428.005 0 0 1-3.334 5.92l-1.703 3.116-1.395 2.52c-1.946 6.548.79 12.803 3.207 18.856 17.707 46.42 27.234 95.8 30.25 145.312l.243 3.987c.502 9.208.507 18.262.507 27.513H459c0-59.708 9.95-118.453 30.102-174.67l.763-2.143c.681-1.909 1.372-3.814 2.063-5.719 2.034-6.464 2.034-6.464 1.29-13.04l-1.288-2.405-1.447-2.748-1.608-2.9c-.545-1.01-1.09-2.018-1.65-3.058-17.36-31.76-38.778-60.689-63.225-87.317l-1.542-1.695c-7.652-8.4-15.508-16.403-23.978-23.978a505.418 505.418 0 0 1-4.164-3.788C378.236 635.838 360.398 622.662 342 611l-2.035-1.294c-10.013-6.33-20.254-12.159-30.705-17.735l-2.69-1.44-2.382-1.263c-2.204-1.277-4.184-2.7-6.188-4.268l5-2.313 3.617-1.675a915.68 915.68 0 0 1 9.64-4.367c20.736-9.316 41.298-19.131 60.21-31.822l2.4-1.57 2.066-1.395c2.757-1.145 4.25-.74 7.067.142Z"/><path fill="#E3302A" d="M495 299h2l.835 1.93c10.872 25.062 21.883 50.207 36.802 73.191l1.163 1.802a265.28 265.28 0 0 0 3.005 4.456c1.618 3.55 1.44 4.906.195 8.621-1.88 3.256-4.04 6.274-6.25 9.313l-1.897 2.656C521.99 413.3 512.773 425.375 503 437l-1.321 1.579c-11.091 13.222-22.876 25.696-35.054 37.921l-2.521 2.536A271.49 271.49 0 0 1 449 493a1362.151 1362.151 0 0 0-3.465 3.07C436.354 504.172 426.82 511.69 417 519l-1.954 1.46c-25.032 18.69-25.032 18.69-36.987 24.907-3.194 1.705-6.305 3.519-9.423 5.355C348.702 562.442 328.078 572.515 307 582l-2.377 1.083c-44.375 20.064-93.25 31.175-141.56 36.23-.777.08-1.553.162-2.353.246C143.11 621.373 125.744 622 108 622V460c33.779 0 33.779 0 45.75 1.188l2.09.197c44.713 4.247 87.782 14.538 130.117 29.513l3.24 1.109c2.188.775 4.336 1.666 6.463 2.598 5.461.646 9.295-2.037 13.965-4.668l3.05-1.657c29.571-16.28 57.707-35.8 82.524-58.725a290.122 290.122 0 0 1 6.504-5.739c5.004-4.366 9.676-9.049 14.36-13.753l2.603-2.592c4.987-4.995 9.757-10.1 14.334-15.471l2.563-2.922C459.04 361.838 478.921 331.157 495 299Z"/><path d="M388 542a112.144 112.144 0 0 1 7.125 4.688l2.085 1.462A839.708 839.708 0 0 1 404 553l2.423 1.746C415.847 561.562 425.12 568.485 434 576c1.03.857 2.062 1.714 3.094 2.57 7.269 6.058 14.277 12.355 21.182 18.824a755.911 755.911 0 0 0 5.454 5.02c7.663 7.028 14.91 14.276 21.853 22.016a400.593 400.593 0 0 0 4.288 4.664A338.361 338.361 0 0 1 507 649l1.248 1.552c7.401 9.207 14.384 18.687 21.223 28.318a342.15 342.15 0 0 0 4.388 5.954c.84 1.142 1.678 2.284 2.516 3.426l2.21 2.953C540 694 540 694 540.056 696.805c-1.472 4.457-3.803 8.118-6.305 12.07C519.158 732.63 507.239 757.528 496 783c-2.072-2.643-3.742-5.244-5.242-8.246l-1.27-2.504-1.363-2.688C471.17 736.745 448.93 707.154 424 680l-1.542-1.695c-7.652-8.4-15.508-16.403-23.978-23.978a505.418 505.418 0 0 1-4.164-3.788C378.236 635.838 360.398 622.662 342 611l-2.035-1.294c-10.013-6.33-20.254-12.159-30.705-17.735l-2.69-1.44-2.382-1.263c-2.204-1.277-4.184-2.7-6.188-4.268l5-2.313 3.617-1.675a915.68 915.68 0 0 1 9.64-4.367c20.736-9.316 41.298-19.131 60.21-31.822l2.4-1.57 2.066-1.395c2.757-1.145 4.25-.74 7.067.142ZM585 783c27.857 41.785 33.249 110.233 36.25 159.5l.243 3.987c.502 9.208.507 18.262.507 27.513h-81c0-34.852 0-34.852 1.188-45.063l.405-3.703C548.164 876.822 560.837 825.71 585 783ZM973 541v81c-10.965 0-21.717-.023-32.625-.75l-1.968-.131C885.494 617.523 832.048 606.507 783 586c3.118-3.353 6.78-5.076 10.875-7l2.48-1.167c17.723-8.141 36.265-14.944 55.067-20.116 2.804-.78 5.595-1.6 8.387-2.42 22.73-6.547 46-10.636 69.504-13.172l3.2-.364C946.04 540.463 959.303 541 973 541Z"/><path fill="#257F23" d="M973 459v81c-20.523 0-39.844-.205-60-3l-2.2-.293c-12.87-1.725-25.392-4.252-37.987-7.394l-2.679-.66C852.041 524.188 834.253 519.109 817 512l-2.323-.953C803.985 506.637 793.433 501.99 783 497v-2c61.712-22.47 124.12-36 190-36Z"/><path fill="#E3302A" d="M541 108h81c0 64.534-11.011 130.232-36 190h-2c-20.936-45.146-35.254-91.427-41-141l-.36-3.089C540.924 138.552 541 123.543 541 108Z"/><path d="M459 108h81c0 42.182-4.15 83.545-17.286 123.757-.541 1.7-1.062 3.407-1.574 5.117-2.484 8.284-5.36 16.363-8.452 24.439l-.728 1.91c-4.508 11.823-9.236 23.482-14.96 34.777h-2c-23.786-60.741-36-124.734-36-190ZM108 460c33.779 0 33.779 0 45.75 1.188l2.09.197c47.064 4.47 99.885 12.7 142.16 34.615-4.935 3.996-10.7 6.093-16.5 8.563l-1.863.795C259.255 514.033 238.427 521.366 217 527l-2.48.667c-18.36 4.917-36.783 8.192-55.663 10.31-1.562.176-3.124.357-4.686.543C138.658 540.342 123.8 540 108 540v-80Z"/><path fill="#2E0A09" d="M540 108h1l.028 1.752c.854 43.343 6.533 85.956 19.972 127.248l1.781 5.625A398.7 398.7 0 0 0 571.875 268l.962 2.495c1.736 4.39 3.652 8.448 6.058 12.513 6.743 11.94 6.743 11.94 5.626 19.032-2.082 6.93-5.328 13.262-8.742 19.62-1.743 3.273-3.36 6.58-4.947 9.93-7.139 14.94-15.3 29.23-23.832 43.41l-3.41 5.688L541 385c-2.732-3.294-5.067-6.597-7.215-10.297l-1.81-3.115c-.63-1.102-1.262-2.203-1.913-3.338l-.993-1.73c-11.166-19.483-21.551-39.324-30.063-60.127-1.023-2.536-1.023-2.536-2.611-5.409-.693-5.236 2.166-9.453 4.48-14.046 1.035-2.149 2.065-4.3 3.09-6.454l1.562-3.279c3.308-7.198 5.988-14.649 8.698-22.089a326.536 326.536 0 0 1 1.978-5.233c2.912-7.603 4.971-15.44 7.078-23.296a252.963 252.963 0 0 1 1.623-5.575c3.067-10.238 5.179-20.58 7.159-31.075l.53-2.797c4.952-26.32 6.912-52.4 7.407-79.14Z"/><path fill="#081A07" d="m786.16 497.492 2.372 1.125 2.53 1.258c1.806.854 3.614 1.704 5.422 2.55l2.787 1.316c22.301 10.292 45.763 17.656 69.574 23.482 2.867.706 5.727 1.44 8.585 2.183 14.031 3.59 28.21 5.769 42.57 7.594l2.732.348c16.68 2.034 33.486 2.265 50.268 2.652v1l-2.186.044c-37.297.83-74.854 4.541-110.814 14.956l-3.193.917c-20.178 5.86-40.67 12.298-59.432 21.888l-2.587 1.314a122.282 122.282 0 0 0-4.58 2.504c-4.034 2.13-6.536 2.667-10.985 1.436A121.465 121.465 0 0 1 774 582l-2.795-1.161a336.274 336.274 0 0 1-9.143-4.152l-3.407-1.59C737.038 564.91 716.309 553.565 696 541c24.014-18.406 53.323-31.101 81-43l2.637-1.266c2.9-.9 3.835-.564 6.523.758Z"/>
                  </svg>
                  <span className="text-black dark:text-white group-hover:underline">Tech For Palestine</span>
                </a>
              </div>
            </div>
          </aside>
        )}

        <main className="flex flex-col-reverse md:grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <section className="col-span-2 space-y-4">
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

            <div className="flex gap-2 mb-10 flex-wrap">
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
              <code className="block p-2 font-mono bg-gray-100 rounded break-all mb-4 dark:bg-[#262b30]">{`![Palestine Support Badge](${badgeUrl})`}</code>

              <h2 className="font-semibold mt-2 mb-0.5">HTML</h2>
              <code className="block p-2 font-mono bg-gray-100 rounded break-all dark:bg-[#262b30]">{`<img src="${badgeUrl}" alt="Palestine Support Badge" />`}</code>
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
