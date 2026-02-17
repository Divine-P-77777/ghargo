import 'server-only'

const dictionaries = {
    en: () => import('./dictionaries/en.json').then((module) => module.default),
    hi: () => import('./dictionaries/hi.json').then((module) => module.default),
    as: () => import('./dictionaries/as.json').then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
    if (['en', 'hi', 'as'].includes(locale)) {
        return dictionaries[locale as 'en' | 'hi' | 'as']()
    }
    return dictionaries['en']()
}
