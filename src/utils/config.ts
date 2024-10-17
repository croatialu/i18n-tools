import { loadConfig as unLoadConfig } from 'unconfig'
import type { I18nConfig } from '../types'

let globalConfig: I18nConfig | undefined
export async function loadConfig(): Promise<I18nConfig> {
  if (globalConfig) {
    return globalConfig
  }
  const { config } = await unLoadConfig<I18nConfig>({
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
  globalConfig = config

  return config
}
