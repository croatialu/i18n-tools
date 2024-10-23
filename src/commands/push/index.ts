import { loadConfig } from '@/utils/config'
import { listLocaleFiles } from '@/utils/file'
import { loadLocalMessages, loadLocalNamespaces, loadRemoteMessages, mergeI18nMessagesToRemote } from '@/utils/messages'
import { isEqual } from 'lodash-es'
import ora from 'ora'
import { pull } from '../pull'

export interface PushOptions {
  dryRun?: boolean
}

export async function push({
  dryRun = false,
}: PushOptions = {}): Promise<void> {
  const config = await loadConfig()

  // PUSH 前， 先拉取远程数据更新本地
  await pull({
    dryRun,
  })

  const spinner = ora('Start pushing').start()
  spinner.info('Start pushing')
  // 将本地数据推送到远程
  config.locales.forEach(async (locale) => {
    const files = listLocaleFiles(locale.path, locale.matcher, locale.ext)

    const push = locale.push || config.push

    if (!push) {
      throw new Error('push is not supported')
    }

    const namespaces = loadLocalNamespaces(files, locale)

    await Promise.all(namespaces.map(async (namespaceSummary) => {
      const spinner = ora(`Pushing locale: ${namespaceSummary.namespace}`).start()
      const localMessages = await loadLocalMessages(namespaceSummary, locale.path, config.loaders)
      const remoteMessages = await loadRemoteMessages(namespaceSummary, locale.pull || config.pull)
      const mergedMessages = await mergeI18nMessagesToRemote(localMessages, remoteMessages)

      if (isEqual(mergedMessages, remoteMessages)) {
        spinner.succeed(`No changes for locale: ${namespaceSummary.namespace}`)
        return
      }

      if (!dryRun) {
        spinner.info(`Pushing locale: ${namespaceSummary.namespace}`)
        await push(namespaceSummary.namespace, mergedMessages, namespaceSummary.summaries)
        spinner.succeed(`Pushed locale: ${namespaceSummary.namespace}`)
      }
      else {
        spinner.succeed(`[Dry Run] Pushed locale: ${namespaceSummary.namespace}`)
      }
    }))
  })
}
