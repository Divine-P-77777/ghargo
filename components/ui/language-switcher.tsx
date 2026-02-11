'use client'

import { useLanguage } from "@/components/providers/LanguageProvider"
import { Button } from "@/components/ui/button"
import { i18n, type Locale } from "@/i18n-config"
import { Globe } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()

    const labels: Record<Locale, string> = {
        en: "English",
        hi: "हिंदी",
        as: "অসমীয়া"
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-slate-100 shadow-xl rounded-xl p-1 bg-white/95 backdrop-blur-sm">
                {i18n.locales.map((locale) => (
                    <DropdownMenuItem
                        key={locale}
                        onClick={() => setLanguage(locale)}
                        className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${language === locale ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
                        <span className="flex-1">{labels[locale]}</span>
                        {language === locale && <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
