import { loadConfig } from 'unconfig'

interface I18nConfig {
  locales: string[]
  defaultLocale: string
  sourceLocale: string
  messages: Record<string, string>
}

export const { config } = await loadConfig<I18nConfig>({
  sources: [
    {
      files: 'i18n.config',
      extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
    },
    {
      files: 'package.json',
      extensions: [],
      rewrite(config: any) {
        return config?.i18n
      },
    },
  ],
  merge: false,
})
