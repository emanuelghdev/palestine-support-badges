import React from 'react'
import { useTranslation } from 'react-i18next'
import useStickyState from './hooks/useStickyState'
import LogoUploader from './components/LogoUploader'
import LogoSelector, { getPresetLogoDataUrl } from './components/LogoSelector'
import BadgePreview from './components/BadgePreview'
import { svgUrlToPngDataUrl } from './utils/svgToPng'


export default function App() {
  const { t, i18n } = useTranslation()

  // Estados persistidos con localStorage
  const [label, setLabel] = useStickyState('build', 'badge_label')
  const [message, setMessage] = useStickyState('passing', 'badge_message')
  const [color, setColor] = useStickyState('4c1', 'badge_color')
  const [logoType, setLogoType] = useStickyState('preset', 'badge_logo_type')
  const [logoValue, setLogoValue] = useStickyState('', 'badge_logo_value')
  const [selectedLogoId, setSelectedLogoId] = useStickyState('', 'badge_selected_logo_id')
  const [history, setHistory] = useStickyState([], 'badge_history')

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
    } catch (err) {
      alert('Failed to export PNG: ' + err.message)
    }
  }

  async function handleDownloadPNG() {
    try {
      const pngDataUrl = await svgUrlToPngDataUrl(badgeUrl)
      const a = document.createElement('a')
      a.href = pngDataUrl
      a.download = 'badge.png'
      a.click()
    } catch (err) {
      alert('Failed to export PNG: ' + err.message)
    }
  }

  function handleSaveHistory() {
    const entry = {
      id: Date.now(),
      label,
      message,
      color,
      logoType,
      logoValue,
      url: badgeUrl
    }
    setHistory(prev => [entry, ...prev].slice(0, 50))
    alert('Saved to history')
  }

  function handleLoadEntry(entry) {
    setLabel(entry.label)
    setMessage(entry.message)
    setColor(entry.color)
    setLogoType(entry.logoType)
    setLogoValue(entry.logoValue)
  }

  function handleClearHistory() {
    if (!confirm('Clear history?')) return
    setHistory([])
  }

  async function handleCopy(text) {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied!')
    } catch (e) {
      alert('Failed to copy')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{t('Palestine Support Badges')}</h1>
          <div className="flex items-center gap-3">
            <label className="text-sm">{t('Language')}:</label>
            <select
              value={i18n.language}
              onChange={e => i18n.changeLanguage(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <section className="col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col">
                <span className="text-sm font-medium">{t('Label')}</span>
                <input className="border rounded p-2" value={label} onChange={e => setLabel(e.target.value)} />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">{t('Message')}</span>
                <input className="border rounded p-2" value={message} onChange={e => setMessage(e.target.value)} />
              </label>
            </div>

            <div className="flex flex-row content-start items-start gap-4 mb-8">
              <div>
                <label className="text-sm font-medium">{t('Color')}</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={color.startsWith('#') ? color : `#${color}`} onChange={e => setColor(e.target.value)} />
                  <input className="border rounded p-2" value={color} onChange={e => setColor(e.target.value)} />
                </div>
              </div>

              <div>
                <LogoSelector selectedId={selectedLogoId} onSelect={setSelectedLogoId} />
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => handleCopy(badgeUrl)}>{t('Copy URL')}</button>
              <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => handleCopy(`![Badge](${badgeUrl})`)}>{t('Copy Markdown')}</button>
              <button className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => handleCopy(`<img src=\"${badgeUrl}\" alt=\"badge\" />`)}>{t('Copy HTML')}</button>
              <button className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleDownloadPNG}>{t('Download PNG')}</button>
              <button className="px-3 py-2 border rounded bg-white border-gray-300 text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 hover:shadow-sm active:bg-gray-100 active:scale-90 cursor-pointer transform ease-in-out" onClick={handleSaveHistory}>{t('Save to history')}</button>
            </div>

            <div className="mt-4">
              <h2 className="font-semibold">URL</h2>
              <code className="block p-2 bg-gray-100 rounded break-all">{badgeUrl}</code>

              <h2 className="font-semibold mt-2">Markdown</h2>
              <code className="block p-2 bg-gray-100 rounded break-all">{`![Badge](${badgeUrl})`}</code>

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
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{t('History')}</h3>
                <button className="text-xs underline" onClick={handleClearHistory}>{t('Clear history')}</button>
              </div>

              {history.length === 0 ? (
                <div className="text-sm text-gray-500">{t('No history yet')}</div>
              ) : (
                <div className="flex flex-col gap-2 max-h-64 overflow-auto">
                  {history.map(entry => (
                    <div key={entry.id} className="flex items-center gap-2 justify-between border p-2 rounded">
                      <div className="flex items-center gap-2" onClick={() => handleLoadEntry(entry)} style={{ cursor: 'pointer' }}>
                        <img src={entry.url} alt="mini" className="w-24 h-6" />
                        <div className="text-xs">
                          <div className="font-medium">{entry.label} — {entry.message}</div>
                          <div className="text-gray-500">{entry.color}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="text-xs px-2 py-1 border rounded" onClick={() => navigator.clipboard.writeText(entry.url)}>Copy</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}
