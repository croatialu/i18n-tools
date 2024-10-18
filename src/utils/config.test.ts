import { describe, it } from 'vitest'
import { loadConfig } from './config'

describe('[utils]config', () => {
  it('should load config', async () => {
    const config = await loadConfig()
  })
})
