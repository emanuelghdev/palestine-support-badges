// src/components/LogoSelector.jsx
import React from 'react'

// Importar raw svg
import logo1Raw from '../assets/logos/logo1.svg?raw'
import logo2Raw from '../assets/logos/logo1.svg?raw'
import logo3Raw from '../assets/logos/logo1.svg?raw'

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
  { id: 'logo1', label: 'Logo 1', svgText: logo1Raw },
  { id: 'logo1', label: 'Logo 1', svgText: logo1Raw },
  { id: 'logo1', label: 'Logo 1', svgText: logo1Raw }
]

export default function LogoSelector({ selectedId, onSelect }) {
  // selectedId es uno de los id de logos o '' (none)
  return (
    <div>
      <div className="text-sm font-medium mb-2">Logo</div>
      
      <select className="block w-full p-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={selectedId} onChange={(e) => onSelect(e.target.value)}>
        <option value="">No logo</option>
        {PRESET_LOGOS.map(p => (
            <option 
            key={p.id} 
            value={p.id}
            title={p.label}
            >
            {p.label}
            </option>
        ))}
      </select>

      <div className="mt-2 muted text-xs">Only palestine support icons are available. For custom logos in your badge go directly to <a href="https://shields.io">Shield.io</a></div>
    </div>
  )
}

// Helper export para poder construir el dataUrl de un id
export const getPresetLogoDataUrl = (id) => {
  const entry = PRESET_LOGOS.find(p => p.id === id)
  if (!entry) return ''
  try {
    const b64 = window.btoa(unescape(encodeURIComponent(entry.svgText)))
    return `data:image/svg+xml;base64,${b64}`
  } catch (e) {
    return `data:image/svg+xml;base64,${window.btoa(entry.svgText)}`
  }
}