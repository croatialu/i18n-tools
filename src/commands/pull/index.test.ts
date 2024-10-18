import type { I18nFileSummary, I18nMessages } from '@/types'
import path from 'node:path'
import { loadConfig } from '@/utils/config'
import { listLocaleFiles, loadLocaleSummary } from '@/utils/file'
import { compact, groupBy } from 'lodash-es'
import { describe, it } from 'vitest'

describe('pull', () => {
  it('should pull', async () => {
    const config = await loadConfig()

    // const files = listLocaleFiles()

    config.locales.forEach(async (locale) => {
      const files = listLocaleFiles(locale.path, locale.matcher, locale.ext)

      if (!config.loaders) {
        throw new Error('loaders is not defined')
      }

      const pull = locale.pull || config.pull

      const localeSummaries: I18nFileSummary[] = compact(files.map((file) => {
        const summary = loadLocaleSummary(file, locale.matcher)
        if (!summary)
          return undefined

        return {
          ...summary,
          filename: file,
          basePath: locale.path,
        }
      }))

      const namespaceMapping = groupBy(localeSummaries, 'namespace')
      const namespaces = Object.keys(namespaceMapping)

      namespaces.forEach(async (namespace) => {
        const localeData = {} as I18nMessages
        await Promise.all(namespaceMapping[namespace].map(async (summary) => {
          const loader = config.loaders![summary.ext]
          const fileData = await loader(path.join(locale.path, summary.filename), summary)
          localeData[summary.locale] = fileData
        }))

        if (pull) {
          const remoteData = await pull(namespace)
        }

        console.log(localeData)
      })
    })
  })
})
