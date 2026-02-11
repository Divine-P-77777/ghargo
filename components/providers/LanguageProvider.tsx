'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { i18n, type Locale } from '@/i18n-config'

type LanguageContextType = {
    language: Locale
    setLanguage: (lang: Locale) => void
    dictionary: Record<string, any>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
    children,
    initialDictionary
}: {
    children: React.ReactNode
    initialDictionary: Record<string, any>
}) {
    const [language, setLanguageState] = useState<Locale>(i18n.defaultLocale)
    const [dictionary, setDictionary] = useState<Record<string, any>>(initialDictionary)

    useEffect(() => {
        // Load saved language preference
        const savedLang = localStorage.getItem('language') as Locale
        if (savedLang && i18n.locales.includes(savedLang)) {
            setLanguageState(savedLang)
            loadDictionary(savedLang)
        }
    }, [])

    const loadDictionary = async (lang: Locale) => {
        try {
            const dict = await import(`@/dictionaries/${lang}.json`)
            setDictionary(dict.default)
        } catch (error) {
            console.error(`Failed to load dictionary for ${lang}`, error)
        }
    }

    const setLanguage = (lang: Locale) => {
        setLanguageState(lang)
        localStorage.setItem('language', lang)
        loadDictionary(lang)
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, dictionary }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
