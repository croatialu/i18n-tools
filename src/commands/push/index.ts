import { loadConfig } from '@/utils/config'
import { listLocaleFiles, loadI18nMessages } from '@/utils/file'
import { loadLocalNamespaces, loadRemoteMessages, mergeI18nMessagesToRemote } from '@/utils/messages'
import { isEqual } from 'lodash-es'
import ora from 'ora'

export interface PushOptions {
  dryRun?: boolean
  /**
   * 是否使用本地数据强制覆盖远端数据 (放弃两者合并)
   */
  force?: boolean
}

export async function push({
  dryRun = false,
  force = false,
}: PushOptions = {}): Promise<void> {
  const config = await loadConfig()

  const { locales } = config
  const spinner = ora('Start pushing').start()
  spinner.info('Start pushing')
  // 将本地数据推送到远程
  locales.forEach(async (locale) => {
    const files = listLocaleFiles(locale.path, locale.matcher, locale.ext)

    const beforePush = locale.hooks?.beforePush || config.hooks?.beforePush
    const afterPush = locale.hooks?.afterPush || config.hooks?.afterPush

    const push = locale.push || config.push

    if (!push) {
      throw new Error('push is not supported')
    }

    const namespaces = loadLocalNamespaces(files, locale)

    await Promise.all(namespaces.map(async (namespaceSummary) => {
      const spinner = ora(`Pushing locale: ${namespaceSummary.namespace}`).start()

      const localMessages = await loadI18nMessages(namespaceSummary.summaries)
      const remoteMessages = await loadRemoteMessages(namespaceSummary, locale.pull || config.pull)
      const mergedMessages = force
        ? localMessages
        : await mergeI18nMessagesToRemote(
          localMessages,
          remoteMessages,
        )

      if (!force && isEqual(mergedMessages, remoteMessages)) {
        spinner.succeed(`No changes for locale: ${namespaceSummary.namespace}`)
        return
      }
      const needPush = await beforePush?.(namespaceSummary.namespace, mergedMessages, namespaceSummary.summaries)

      if (needPush === false) {
        spinner.succeed(`Skipped locale: ${namespaceSummary.namespace}`)
        return
      }

      if (!dryRun) {
        spinner.info(`Pushing locale: ${namespaceSummary.namespace}`)
        await push(namespaceSummary.namespace, mergedMessages, namespaceSummary.summaries)
        spinner.succeed(`Pushed locale: ${namespaceSummary.namespace}`)
        await afterPush?.(namespaceSummary.namespace, mergedMessages, namespaceSummary.summaries)
      }
      else {
        spinner.succeed(`[Dry Run] Pushed locale: ${namespaceSummary.namespace}`)
      }
    }))
  })
}
