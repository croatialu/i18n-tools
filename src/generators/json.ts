import fs from 'node:fs'
import { defineGenerator } from '@/define'
import type { I18nGenerator } from '@/types'

export const jsonGenerator: I18nGenerator = defineGenerator(async (filename, message) => {
  const content = JSON.stringify(message, null, 2)

  await fs.writeFileSync(filename, content)
})
