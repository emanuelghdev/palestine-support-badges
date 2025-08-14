// src/components/LogoSelector.jsx
import React from 'react'

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
  { id: 'logo1', label: 'Logo 1', svgText: logo1Raw },
  { id: 'logo2', label: 'Logo 2', svgText: logo2Raw },
  { id: 'logo3', label: 'Logo 3', svgText: logo3Raw },
  { id: 'logo4', label: 'Logo 4', svgText: logo4Raw },
  { id: 'logo5', label: 'Logo 5', svgText: logo5Raw },
  { id: 'logo6', label: 'Logo 6', svgText: logo6Raw },
  { id: 'logo7', label: 'Logo 7', svgText: logo7Raw },
  { id: 'logo8', label: 'Logo 8', svgText: logo8Raw },
  { id: 'logo9', label: 'Logo 9', svgText: logo9Raw },
  { id: 'logo10', label: 'Logo 10', svgText: logo10Raw },
  { id: 'logo11', label: 'Logo 11', svgText: logo11Raw },
  { id: 'logo12', label: 'Logo 12', svgText: logo12Raw },
  { id: 'logo13', label: 'Logo 13', svgText: logo13Raw },
  { id: 'logo14', label: 'Logo 14', svgText: logo14Raw }
]

export default function LogoSelector({ selectedId, onSelect }) {
  // selectedId es uno de los id de logos o '' (none)
  return (
    <div>
      <div className="text-sm font-medium mb-2">Logo</div>
      
      <select className="block w-full h-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:border-black  sm:text-sm" value={selectedId} onChange={(e) => onSelect(e.target.value)}>
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

      <div className="mt-2 muted text-xs text-gray-400">Only palestine support icons are available. For custom logos in your badge go directly to <a href="https://shields.io" className="text-lime-400 hover:underline">Shield.io</a></div>
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