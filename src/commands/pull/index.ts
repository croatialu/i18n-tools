import { loadConfig } from '@/utils/config'
import type { I18nConfig } from '@/types'

export async function pull(): Promise<I18nConfig> {
  const config = await loadConfig()

  return config
}
