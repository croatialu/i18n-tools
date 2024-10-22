import type { I18nConfig, I18nLocaleConfig, I18nMergeOptions } from '@/types'
import { generateFile, listLocaleFiles } from '@/utils/file'
import { loadLocalMessages, loadLocalNamespaces, loadRemoteMessages, mergeI18nMessagesToLocal } from '@/utils/messages'

export interface PullOptions {
  mergeOptions?: I18nMergeOptions | ((namespace: string) => I18nMergeOptions)
  locales?: I18nLocaleConfig[]
  loaders?: I18nConfig['loaders']
  generators?: I18nConfig['generators']
  pull?: I18nConfig['pull']
}

export async function pull({
  mergeOptions,
  locales = [],
  loaders,
  generators,
  pull,
}: PullOptions = {}): Promise<void> {
  locales.forEach(async (locale) => {
    const files = listLocaleFiles(locale.path, locale.matcher, locale.ext)

    const namespaces = loadLocalNamespaces(files, locale)

    await Promise.all(namespaces.map(async (namespaceSummary) => {
      const localMergeOptions = typeof mergeOptions === 'function'
        ? mergeOptions(namespaceSummary.namespace)
        : mergeOptions

      const localMessages = await loadLocalMessages(namespaceSummary, locale.path, loaders)
      const remoteMessages = await loadRemoteMessages(namespaceSummary, locale.pull || pull)
      const mergedMessages = await mergeI18nMessagesToLocal(
        localMessages,
        remoteMessages,
        localMergeOptions?.policy,
        localMergeOptions?.freezeDefaultLanguage,
      )

      await generateFile(namespaceSummary, mergedMessages, generators)
    }))
  })
}
