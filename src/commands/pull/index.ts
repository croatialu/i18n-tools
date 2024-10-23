import { loadConfig } from '@/utils/config'
import { generateFile, listLocaleFiles } from '@/utils/file'
import { loadLocalMessages, loadLocalNamespaces, loadRemoteMessages, mergeI18nMessagesToLocal } from '@/utils/messages'
import { isEqual } from 'lodash-es'
import ora from 'ora'

export interface PullOptions {
  dryRun?: boolean
}

export async function pull({
  dryRun = false,
}: PullOptions = {}): Promise<void> {
  const config = await loadConfig()
  const { locales, loaders, generators, pull, mergeOptions, hooks } = config

  const spinner = ora('Start pulling').start()
  spinner.info('Start pulling')
  await Promise.all(locales.map(async (locale, index) => {
    const files = listLocaleFiles(locale.path, locale.matcher, locale.ext)

    const namespaces = loadLocalNamespaces(files, locale)
    const tmpMergeOptions = locale.mergeOptions || mergeOptions
    const beforePull = locale.hooks?.beforePull || hooks?.beforePull
    const afterPull = locale.hooks?.afterPull || hooks?.afterPull

    await Promise.all(namespaces.map(async (namespaceSummary) => {
      const spinner = ora(`Pulling locale: ${namespaceSummary.namespace}`).start()
      const localMergeOptions = typeof tmpMergeOptions === 'function'
        ? tmpMergeOptions(namespaceSummary.namespace, 'pull')
        : tmpMergeOptions
      const localMessages = await loadLocalMessages(namespaceSummary, locale.path, loaders)

      await beforePull?.(namespaceSummary.namespace, namespaceSummary.summaries)
      const remoteMessages = await loadRemoteMessages(namespaceSummary, locale.pull || pull)
      await afterPull?.(namespaceSummary.namespace, remoteMessages)

      const mergedMessages = await mergeI18nMessagesToLocal(
        localMessages,
        remoteMessages,
        localMergeOptions?.policy,
        localMergeOptions?.freezeDefaultLanguage,
      )

      if (isEqual(mergedMessages, remoteMessages)) {
        spinner.succeed(`No changes for locale: ${namespaceSummary.namespace}`)
        return
      }

      if (!dryRun) {
        spinner.info(`Generating locale: config[${index}]  ${namespaceSummary.namespace}`)
        await generateFile(namespaceSummary, mergedMessages, generators)
        spinner.succeed(`Generated locale: config[${index}] ${namespaceSummary.namespace}`)
      }
      else {
        spinner.succeed(`[Dry Run] Generated locale: config[${index}] ${namespaceSummary.namespace}`)
      }
    }))
  }))

  spinner.succeed('Pulling completed')
}
