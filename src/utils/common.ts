import type { I18nMessages } from '@/types'
import { get, set } from 'lodash-es'

// 递归获取对象所有的key
export function getObjectAllKeys(
  obj: Record<string, any> = {},
  parentKey = '',
): string[] {
  // 获取对象所有 key
  return Object.keys(obj).flatMap((key) => {
    const value = obj[key]
    const fullKey = parentKey ? `${parentKey}.${key}` : key
    return typeof value === 'object' && value !== null
      ? getObjectAllKeys(value, fullKey)
      : fullKey
  }).sort((a, b) => a.localeCompare(b))
}

export function ensureNotFalsy<T>(obj: T | false | undefined | null, message = ''): T {
  if (!obj)
    throw new Error(`ensureNotFalsy() is falsy: ${message}`)

  return obj
}

export function i18nMessagesToList(messages: I18nMessages, defaultLanguage: string): {
  key: string
  [x: string]: string
}[] {
  const message = messages[defaultLanguage]
  const allLanguages = Object.keys(messages)

  if (!message) {
    throw new Error(`defaultLanguage ${defaultLanguage} is not found in messages`)
  }

  const allKeys = getObjectAllKeys(message)

  return allKeys.map((key) => {
    // const value = get(message, key)

    const values = allLanguages.reduce((acc, language) => {
      const keyPath = [language, ...key.split('.')]
      acc[language] = get(messages, keyPath)
      return acc
    }, {} as Record<string, string>)
    return {
      ...values,
      key,
    }
  })
}

export function listToI18nMessages(list: { key: string, [x: string]: string }[]): I18nMessages {
  const messages: Record<string, Record<string, any>> = {}

  list.forEach((item) => {
    const { key, ...values } = item

    Object.entries(values).forEach(([language, value]) => {
      const keyPath = [language, ...key.split('.')]
      set(messages, keyPath, value)
    })
  })

  return messages
}
