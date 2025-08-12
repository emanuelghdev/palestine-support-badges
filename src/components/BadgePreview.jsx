import React from 'react'

export default function BadgePreview({ url, alt }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <img className="badge-img transition-transform duration-250 hover:scale-130" src={url} alt={alt} />
    </div>
  )
}