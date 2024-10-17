export interface I18nConfig {
  defaultLanguage: string
  loaders?: Record<string, I18nLoader>
  generators?: Record<string, I18nGenerator>
  pull?: (namespace: string) => Promise<I18nMessages>
  push?: (namespace: string, message: I18nMessages) => Promise<void>
  locales: Array<{
    path: string
    matcher: string
    ext?: string
    pull?: I18nConfig['pull'] | false
    push?: I18nConfig['push'] | false
  }>
}

export type I18nMessage = Record<string, unknown>

export interface I18nMessages {
  [locale: string]: I18nMessage
}

export interface I18nLocaleSummary {
  namespace: string
  locale: string
  ext: string
}

export interface I18nLoader {
  (filename: string, summary: I18nLocaleSummary): Promise<I18nMessage>
}

export interface I18nGenerator {
  (filename: string, message: I18nMessage, summary: I18nLocaleSummary): Promise<void>
}
