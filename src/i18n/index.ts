import { createI18n } from 'vue-i18n'
import ja from './locales/ja'
import en from './locales/en'

export type AppLocale = 'ja' | 'en'

const LOCALE_STORAGE_KEY = 'locale'

export function getSavedLocale(): AppLocale {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
  return saved === 'en' ? 'en' : 'ja'
}

export function saveLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

export const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale(),
  fallbackLocale: 'ja',
  messages: { ja, en },
})

saveLocale(getSavedLocale())
