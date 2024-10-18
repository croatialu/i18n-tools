import type { I18nConfig } from '@/types'
import { loadConfig } from '@/utils/config'

export async function pull(): Promise<I18nConfig> {
  const config = await loadConfig()

  return config
}
