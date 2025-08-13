import React from 'react'

export default function BadgePreview({ url, alt }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <img className="badge-img w-24 md:w-32 lg:w-36 h-auto max-h-[150px] mb-1.5 mt-1 transition-transform duration-250 hover:scale-115" src={url} alt={alt} />
    </div>
  )
}