import type { I18nConfig, I18nFileSummary, I18nLocaleConfig, I18nMergePolicy, I18nMessages, I18nNamespaceSummary } from '@/types'
import path from 'node:path'
import { get, set } from 'lodash-es'
import { getObjectAllKeys } from './common'
import { loadConfig } from './config'
import { loadLocaleSummary } from './file'

export async function mergeI18nMessagesToLocal(
  localMessages: I18nMessages,
  remoteMessages: I18nMessages,
  policy: I18nMergePolicy = 'remote-first',
  // 是否冻结默认语言的值，冻结后默认语言的值将不会被覆盖
  freezeDefaultLanguage = true,
): Promise<I18nMessages> {
  const config = await loadConfig()

  const defaultLanguageMessages = localMessages[config.defaultLanguage]

  const mergedMessages: I18nMessages = {
    [config.defaultLanguage]: defaultLanguageMessages,
  }

  const allKeys = getObjectAllKeys(defaultLanguageMessages)

  const localeKeys = Object.keys(localMessages)
  localeKeys.forEach((locale) => {
    if (locale === config.defaultLanguage && freezeDefaultLanguage)
      return
    if (!get(mergedMessages, locale)) {
      set(mergedMessages, locale, {})
    }

    allKeys.forEach((key) => {
      const keyPath = [locale, ...key.split('.')]
      const localValue = get(localMessages, keyPath)
      const remoteValue = get(remoteMessages, keyPath)

      let newValue = ''
      switch (policy) {
        case 'local-first':
          newValue = localValue || remoteValue
          break
        case 'remote-first':
          newValue = remoteValue || localValue
          break
      }

      set(mergedMessages, keyPath, newValue)
    })
  })

  return mergedMessages
}

export async function mergeI18nMessagesToRemote(
  localMessages: I18nMessages,
  remoteMessages: I18nMessages,
): Promise<I18nMessages> {
  const config = await loadConfig()

  const defaultLanguageMessages = localMessages[config.defaultLanguage]

  const mergedMessages: I18nMessages = {
    [config.defaultLanguage]: defaultLanguageMessages,
  }

  const allKeys = getObjectAllKeys(defaultLanguageMessages)
  const localeKeys = Object.keys(localMessages)

  localeKeys.forEach((locale) => {
    if (locale === config.defaultLanguage)
      return

    allKeys.forEach((key) => {
      const keyPath = [locale, ...key.split('.')]
      const remoteValue = get(remoteMessages, keyPath)
      set(mergedMessages, keyPath, remoteValue)
    })
  })

  return mergedMessages
}

export function loadLocalNamespaces(files: string[], locale: I18nLocaleConfig): I18nNamespaceSummary[] {
  const namespaceMapping: Record<string, I18nFileSummary[]> = {}

  files.forEach((file) => {
    const summary = loadLocaleSummary(file, locale.matcher)
    if (!summary)
      return
    namespaceMapping[summary.namespace] = [
      ...(namespaceMapping[summary.namespace] || []),
      { ...summary, filename: file, basePath: locale.path },
    ]
  })

  return Object.entries(namespaceMapping)
    .map(([namespace, summaries]) => ({ namespace, summaries }))
}

export async function loadLocalMessages(
  namespaceSummary: I18nNamespaceSummary,
  basePath: string,
  loaders: I18nConfig['loaders'],
): Promise<I18nMessages> {
  const { summaries } = namespaceSummary
  const localeMessages = {} as I18nMessages
  await Promise.all(summaries.map(async (summary) => {
    const loader = loaders![summary.ext]
    if (!loader) {
      throw new Error(`${summary.ext} 的loader未定义`)
    }
    const fileData = await loader(path.join(basePath, summary.filename), summary)
    localeMessages[summary.locale] = fileData
  }))
  return localeMessages
}

export async function loadRemoteMessages(
  namespaceSummary: I18nNamespaceSummary,
  pull: I18nConfig['pull'],
): Promise<I18nMessages> {
  const { namespace, summaries } = namespaceSummary

  if (!pull) {
    throw new Error('push 时，locale.pull 或 config.pull 未定义')
  }

  return pull(namespace, summaries)
}
