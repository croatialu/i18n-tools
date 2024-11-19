import type { I18nConfig, I18nFileSummary, I18nKey, I18nLocaleSummary, I18nMessage, I18nMessages, I18nNamespaceSummary } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import { get, merge, set } from 'lodash-es'
import { getObjectAllKeys } from './common'
import { loadConfig } from './config'
import { parsePatchMatcher } from './path-matcher'

export function listFiles(dir: string, options: { recursive: boolean }): string[] {
  const ls = (currentDir: string): string[] => {
    // 列出所有文件
    const files = fs.readdirSync(currentDir)
    const result: string[] = []
    for (const file of files) {
      const filePath = path.join(currentDir, file)
      if (fs.statSync(filePath).isDirectory()) {
        if (options.recursive) {
          result.push(...ls(filePath))
        }
      }
      else {
        let relativePath = filePath.replace(dir, '')
        if (relativePath.startsWith('/')) {
          relativePath = relativePath.slice(1)
        }

        result.push(relativePath)
      }
    }
    return result
  }

  return ls(dir)
}

export function loadLocaleSummary(filename: string, matcher: string): I18nLocaleSummary | undefined {
  const regexp = parsePatchMatcher(matcher)
  const match = regexp.exec(filename)
  if (match) {
    const { namespace, locale } = match.groups as Record<string, string>
    const ext = filename.split('.').pop()!
    return {
      namespace,
      locale,
      ext: `.${ext}`,
    }
  }
}

export function listLocaleFiles(dir: string, matcher: string, ext = ''): string[] {
  const files = listFiles(dir, { recursive: true })
  const regex = parsePatchMatcher(matcher, ext)
  return files.filter(file => regex.test(file))
}

export function loadLocaleInfo(dir: string, matcher: string, ext = ''): {
  namespace: string[]
  locales: string[]
  ext?: string
} | undefined {
  const files = listLocaleFiles(dir, matcher, ext)

  const result = {
    namespace: new Set<string>(),
    locales: new Set<string>(),
    ext: ext as string | undefined,
  }

  for (const file of files) {
    const summary = loadLocaleSummary(file, matcher)
    if (summary) {
      result.namespace.add(summary.namespace)
      result.locales.add(summary.locale)
      if (summary.ext) {
        result.ext = summary.ext
      }
    }
  }

  if (!result.namespace) {
    return undefined
  }

  return {
    namespace: Array.from(result.namespace),
    locales: Array.from(result.locales),
    ext: result.ext,
  }
}

export async function loadI18nMessages(summaries: I18nFileSummary[]): Promise<I18nMessages> {
  const config = await loadConfig()
  let resultMapping: Record<I18nKey, I18nMessage> = {}

  for (const summary of summaries) {
    const loader = config.loaders![summary.ext]
    if (!loader) {
      throw new Error(`Loader for ${summary.ext} not found`)
    }

    const message = await loader(path.join(summary.basePath, summary.filename), summary)

    const keys = getObjectAllKeys(message)

    const mapping = keys.reduce((acc, key) => {
      const keyPaths = key.split('.')
      acc[key] = {
        [summary.locale]: get(message, keyPaths),
      }
      return acc
    }, {} as Record<string, any>)

    resultMapping = merge(resultMapping, mapping)
  }

  const allKeys = Object.keys(resultMapping).sort()

  return allKeys.map(key => ({
    ...resultMapping[key],
    key,
  }))
}

export async function generateFile(
  namespaceSummary: I18nNamespaceSummary,
  messages: I18nMessages,
  generators: I18nConfig['generators'],
): Promise<void> {
  const { summaries } = namespaceSummary

  if (!generators) {
    throw new Error('generators 未定义')
  }

  for (const localeFileSummary of summaries) {
    const { basePath, filename, ext, locale } = localeFileSummary
    const outputPath = path.join(basePath, filename)

    const generator = generators[ext]

    if (!generator) {
      throw new Error(`${ext} 的 generator 未定义`)
    }
    const messageRecord = messages.reduce((acc, message) => {
      const paths = message.key.split('.')
      const lastKey = paths.pop()!

      if (!get(acc, paths)) {
        set(acc, paths, {})
      }

      set(acc, [...paths, lastKey], message[locale])

      return acc
    }, {} as Record<I18nKey, any>)

    await generator(outputPath, messageRecord, localeFileSummary)
  }
}
