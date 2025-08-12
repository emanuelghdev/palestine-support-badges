import { useState, useEffect } from 'react'

export default function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const sticky = window.localStorage.getItem(key)
      return sticky !== null ? JSON.parse(sticky) : defaultValue
    } catch (e) {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      // Ignorar
    }
  }, [key, value])

  return [value, setValue]
}