import type { I18nFileSummary, I18nLocaleSummary, I18nMessages } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
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
      ext,
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
  const messages = {} as I18nMessages

  for (const summary of summaries) {
    const loader = config.loaders![summary.ext]
    if (!loader) {
      throw new Error(`Loader for ${summary.ext} not found`)
    }

    const message = await loader(path.join(summary.basePath, summary.filename), summary)
    messages[summary.locale] = message
  }

  return messages
}
