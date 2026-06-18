import { createI18n } from 'vue-i18n'
import ja from './locales/ja'
import en from './locales/en'

export type AppLocale = 'ja' | 'en'

const LOCALE_STORAGE_KEY = 'locale'

const SUPPORTED_LOCALES = ['ja', 'en'] as const

function getBrowserLocale(): AppLocale {
  const candidates = [navigator.language, ...(navigator.languages ?? [])]
  for (const tag of candidates) {
    const code = tag.split('-')[0]?.toLowerCase()
    if (code === 'en') return 'en'
    if (code === 'ja') return 'ja'
  }
  return 'ja'
}

export function getInitialLocale(): AppLocale {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (saved && SUPPORTED_LOCALES.includes(saved as AppLocale)) {
    return saved as AppLocale
  }
  return getBrowserLocale()
}

export function saveLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'ja',
  messages: { ja, en },
})

saveLocale(getInitialLocale())
