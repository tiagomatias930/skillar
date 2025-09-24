import { useState, useEffect } from 'react'

export function useLocalStorage(key: string, initialValue: string | null = null) {
  const [storedValue, setStoredValue] = useState<string | null>(initialValue)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key)
        setStoredValue(item)
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      setStoredValue(initialValue)
    }
  }, [key, initialValue])

  const setValue = (value: string | null) => {
    try {
      setStoredValue(value)
      if (typeof window !== 'undefined') {
        if (value === null) {
          localStorage.removeItem(key)
        } else {
          localStorage.setItem(key, value)
        }
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

export function useUsername() {
  return useLocalStorage('skillar_username')
}