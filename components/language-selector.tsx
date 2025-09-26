"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

const languages = [
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const

export function LanguageSelector() {
  const { language, changeLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false)
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = async (locale: typeof languages[number]['code']) => {
    if (locale === language) {
      setIsOpen(false)
      return
    }
    
    setIsChanging(true)
    setIsOpen(false)
    
    // Pequeno delay para mostrar o estado de carregamento
    setTimeout(() => {
      changeLanguage(locale)
      window.location.reload()
    }, 500)
  }

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 min-w-[120px]"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">
          {isChanging ? "..." : `${currentLanguage.flag} ${currentLanguage.name}`}
        </span>
        <span className="sm:hidden">
          {isChanging ? "..." : currentLanguage.flag}
        </span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-[#06224A] border rounded-md shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md transition-colors ${
                lang.code === language ? 'bg-blue-50 text-blue-600 font-medium' : ''
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {lang.code === language && (
                <span className="ml-auto text-black-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
      
    </div>
  )
}