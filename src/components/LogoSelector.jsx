// src/components/LogoSelector.jsx
import React, { useState, useRef, useEffect } from 'react'

// Importar raw svg
import logo1Raw from '../assets/logos/logo1.svg?raw'
import logo2Raw from '../assets/logos/logo2.svg?raw'
import logo3Raw from '../assets/logos/logo3.svg?raw'
import logo4Raw from '../assets/logos/logo4.svg?raw'
import logo5Raw from '../assets/logos/logo5.svg?raw'
import logo6Raw from '../assets/logos/logo6.svg?raw'
import logo7Raw from '../assets/logos/logo7.svg?raw'
import logo8Raw from '../assets/logos/logo8.svg?raw'
import logo9Raw from '../assets/logos/logo9.svg?raw'
import logo10Raw from '../assets/logos/logo10.svg?raw'
import logo11Raw from '../assets/logos/logo11.svg?raw'
import logo12Raw from '../assets/logos/logo12.svg?raw'
import logo13Raw from '../assets/logos/logo13.svg?raw'
import logo14Raw from '../assets/logos/logo14.svg?raw'

function encodeToDataUrl(svgText) {
  try {
    // Encoder
    const b64 = window.btoa(unescape(encodeURIComponent(svgText)))
    return `data:image/svg+xml;base64,${b64}`
  } catch (e) {
    // Fallback
    return `data:image/svg+xml;base64,${window.btoa(svgText)}`
  }
}

// Construir la lista de logos
const PRESET_LOGOS = [
  { id: 'logo1', label: 'Flag of Palestine 1', svgText: logo1Raw },
  { id: 'logo2', label: 'Flag of Palestine 2', svgText: logo2Raw },
  { id: 'logo3', label: 'Flag of Palestine 3', svgText: logo3Raw },
  { id: 'logo4', label: 'Flag of Palestine 4', svgText: logo4Raw },
  { id: 'logo5', label: 'Flag of Palestine 5', svgText: logo5Raw },
  { id: 'logo6', label: 'Map of Palestine', svgText: logo6Raw },
  { id: 'logo7', label: 'Watermelon', svgText: logo7Raw },
  { id: 'logo8', label: 'Olive branch 1', svgText: logo8Raw },
  { id: 'logo9', label: 'Olive branch 2', svgText: logo9Raw },
  { id: 'logo10', label: 'Olive branch 3', svgText: logo10Raw },
  { id: 'logo11', label: 'Key of return', svgText: logo11Raw },
  { id: 'logo12', label: 'Dome of the rock', svgText: logo12Raw },
  { id: 'logo13', label: 'Keffiyeh', svgText: logo13Raw },
  { id: 'logo14', label: 'Handala', svgText: logo14Raw }
]

export default function LogoSelector({ selectedId = '', onSelect = () => {} }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const selected = PRESET_LOGOS.find(p => p.id === selectedId) || null

  return (
    <div ref={containerRef} className="relative">
      <div className="text-sm font-medium mb-2">Logo</div>

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 h-10 px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:border-black sm:text-sm bg-white"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <img src={encodeToDataUrl(selected.svgText)} alt={selected.label} className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{selected.label}</span>
            </>
          ) : (
            <span className="text-gray-500">No logo</span>
          )}
        </div>

        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.23 3.97a.75.75 0 01-1.04 0L5.25 8.27a.75.75 0 01-.02-1.06z" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-activedescendant={selected ? selected.id : undefined}
          className="absolute z-40 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-auto"
        >
          <li
            key="none"
            role="option"
            onClick={() => { onSelect(''); setOpen(false) }}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
          >
            <span className="text-gray-500">No logo</span>
          </li>

          {PRESET_LOGOS.map(p => (
            <li
              key={p.id}
              role="option"
              aria-selected={p.id === selectedId}
              onClick={() => { onSelect(p.id); setOpen(false) }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <img src={encodeToDataUrl(p.svgText)} alt={p.label} className="w-6 h-6 flex-shrink-0" />
              <span className="truncate">{p.label}</span>
              {p.id === selectedId && <span className="ml-auto text-xs text-gray-400">Selected</span>}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 muted text-xs text-gray-400">
        Only palestine support icons are available. For custom logos in your badge go directly to{' '}
        <a href="https://shields.io" className="text-lime-400 hover:underline">Shield.io</a>
      </div>
    </div>
  )
}

// Helper export para poder construir el dataUrl de un id
export const getPresetLogoDataUrl = (id) => {
  const entry = PRESET_LOGOS.find(p => p.id === id)
  if (!entry) return ''

  // Encode svg a Base64
  try {
    const b64 = window.btoa(unescape(encodeURIComponent(entry.svgText)))
    return `data:image/svg+xml;base64,${b64}`
  } catch (e) {
    return `data:image/svg+xml;base64,${window.btoa(entry.svgText)}`
  }
}