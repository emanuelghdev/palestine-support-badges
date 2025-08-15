import React, { useState, useRef, useEffect, useId } from 'react'

export default function TooltipIcon({ tipTitle, content }) {
  const [visible, setVisible] = useState(false)
  const btnRef = useRef(null)
  const id = useId ? useId() : `tooltip-${Math.random().toString(36).slice(2, 9)}`

  useEffect(() => {
    function onDocClick(e) {
      if (!btnRef.current) return
      if (!btnRef.current.contains(e.target)) setVisible(false)
    }
    document.addEventListener('pointerdown', onDocClick)
    return () => document.removeEventListener('pointerdown', onDocClick)
  }, [])

  return (
    <div className="relative inline-block ml-1">
      {/* Icono de ayuda */}
      <button
        ref={btnRef}
        type="button"
        aria-label={tipTitle}
        aria-expanded={visible}
        aria-controls={id}
        aria-describedby={visible ? id : undefined}
        className="w-4 h-4 flex items-center rounded-full text-gray-400"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible(v => !v)} // Útil en pantallas táctiles
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hover:text-blue-500 transition-colors duration-200 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Tooltip */}
      {visible && (
        <div id={id} role="tooltip" className="absolute z-10 left-3 w-auto px-2.5 py-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg animate-pop">
          <div className="text-blue-600 font-medium mb-1">{tipTitle}</div>
          <div className="text-gray-600">{content}</div>
        </div>
      )}
      {/* Popup animation */}
      <style>{`
        .animate-pop {
          animation: pop .2s cubic-bezier(.2,.9,.2,1) both;
          transform-origin: center bottom;
        }
        @keyframes pop {
          from { transform: scale(.85); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}