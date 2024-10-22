import { loadConfig } from '@/utils/config'
import { generateFile, listLocaleFiles } from '@/utils/file'
import { loadLocalMessages, loadLocalNamespaces, loadRemoteMessages, mergeI18nMessagesToRemote } from '@/utils/messages'
import { pull } from '../pull'

export async function push(): Promise<void> {
  const config = await loadConfig()

  // PUSH 前， 先拉取远程数据更新本地
  await pull()

  // 将本地数据推送到远程
  config.locales.forEach(async (locale) => {
    const files = listLocaleFiles(locale.path, locale.matcher, locale.ext)

    const namespaces = loadLocalNamespaces(files, locale)

    await Promise.all(namespaces.map(async (namespaceSummary) => {
      const localMessages = await loadLocalMessages(namespaceSummary, locale.path, config.loaders)
      const remoteMessages = await loadRemoteMessages(namespaceSummary, locale.pull || config.pull)
      const mergedMessages = await mergeI18nMessagesToRemote(localMessages, remoteMessages)

      await generateFile(namespaceSummary, mergedMessages, config.generators)
    }))
  })
}
