import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'

const availableLocales = ['en', 'fr']
const defaultLocale = 'fr'

const getInitialLocale = (): string => {
  // 1. Check localStorage
  const saved = localStorage.getItem('locale')
  if (saved && availableLocales.includes(saved)) {
    return saved
  }
  
  // 2. Check browser languages (in order of preference)
  const browserLanguages = navigator.languages || [navigator.language]
  
  for (const lang of browserLanguages) {
    const langCode = lang.split('-')[0].toLowerCase()
    if (availableLocales.includes(langCode)) {
      return langCode
    }
  }
  
  // 3. Default fallback
  return defaultLocale
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: defaultLocale,
  messages: {
    en,
    fr
  }
})

export default i18n