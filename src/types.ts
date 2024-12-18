export interface I18nConfig {
  defaultLanguage: string
  loaders?: Record<`.${string}`, I18nLoader>
  generators?: Record<`.${string}`, I18nGenerator>
  formatter?: I18nFormatter
  hooks?: I18nHooks
  pull?: (namespace: string, summaries: I18nLocaleSummary[]) => Promise<I18nMessages>
  push?: (namespace: string, message: I18nMessages, summaries: I18nLocaleSummary[]) => Promise<void>
  mergeOptions?: I18nMergeOptions | ((namespace: string, action: 'pull' | 'push') => I18nMergeOptions)
  locales: Array<I18nLocaleConfig>
}

export interface I18nLocaleConfig {
  path: string
  matcher: string
  ext?: `.${string}`
  pull?: I18nConfig['pull']
  push?: I18nConfig['push']
  mergeOptions?: I18nConfig['mergeOptions']
  hooks?: I18nHooks
}

export interface I18nHooks {
  beforePull?: (namespace: string, summaries: I18nLocaleSummary[]) => Promise<void>
  afterPull?: (namespace: string, messages: I18nMessages) => Promise<void>
  beforePush?: (namespace: string, messages: I18nMessages, summaries: I18nLocaleSummary[]) => Promise<boolean>
  afterPush?: (namespace: string, messages: I18nMessages, summaries: I18nLocaleSummary[]) => Promise<void>
}

export type I18nFormatter = 'prettier' | 'eslint' | 'auto' | false

/**
 * 使用点号连接的key
 */
export type I18nKey = string

interface I18nLocaleMessage {
  [locale: string]: string | undefined
}

export type I18nMessage = I18nLocaleMessage & {
  deletedAt?: string
  key: I18nKey
}

export type I18nMessages = I18nMessage[]

export interface I18nLocaleSummary {
  namespace: string
  locale: string
  ext: `.${string}`
}

export interface I18nFileSummary extends I18nLocaleSummary {
  filename: string
  basePath: string
}

export interface I18nNamespaceSummary {
  namespace: string
  summaries: I18nFileSummary[]
}

export interface I18nLoader {
  (filename: string, summary: I18nLocaleSummary): Promise<Record<string, any>>
}

export interface I18nGenerator {
  (filename: string, message: Record<string, any>, summary: I18nLocaleSummary): Promise<void>
}

export type I18nMergePolicy = 'local-first' | 'remote-first'

export interface I18nMergeOptions {
  /**
   * @default 'remote-first'
   */
  policy?: I18nMergePolicy
}
