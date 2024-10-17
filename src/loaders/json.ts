import fs from 'node:fs'
import { defineLoader } from '@/define'
import type { I18nLoader } from '@/types'

export const jsonLoader = defineLoader(async (file) => {
  const content = await fs.readFileSync(file, 'utf8')
  return JSON.parse(content)
})
