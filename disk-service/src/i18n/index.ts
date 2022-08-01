import type { ErrorFormater } from 'zoply-schema'
import locale from 'locale'
import ru from './dictionaries/ru'
import en from './dictionaries/en'

export enum Language {
  RU = 'ru',
  EN = 'en',
}
const defaultLang = Language.RU

const acceptLangCache = new Map<string, Language>()
const supportedLangs = new locale.Locales(Object.values(Language), defaultLang)
export const dictionaries: Record<Language, typeof en> = {
  ru,
  en,
}

export const formatErrorMsg = (lang: Language): ErrorFormater => ({ rule, name, meta }) => {
  const dictionary = dictionaries[lang]

  switch (rule) {
    case 'required':
      return dictionary.REQUIRED.replace('#name#', name)
    case 'requiredList':
      return dictionary.REQUIRED_LIST.replace('#name#', name)
    case 'optional':
      return dictionary.OPTIONAL.replace('#name#', name)
    case 'array':
      return dictionary.ARRAY.replace('#name#', name)
    case 'email':
      return dictionary.EMAIL.replace('#name#', name)
    case 'number':
      return dictionary.NUMBER.replace('#name#', name)
    case 'oneOf':
      return dictionary.ONE_OF
        .replace('#name#', name)
        .replace('#meta#', meta!.values.join(', '))
    default:
      return dictionary.UNKNOWN
  }
}

export function parseAcceptLanguage(acceptLanguage: string): Language {
  if (acceptLangCache.has(acceptLanguage)) {
    return acceptLangCache.get(acceptLanguage)!
  }

  const locales = new locale.Locales(acceptLanguage)
  const language = locales.best(supportedLangs).toString() as Language

  acceptLangCache.set(acceptLanguage, language)

  return language
}
