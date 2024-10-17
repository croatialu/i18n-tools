import fs from 'node:fs'
import { defineGenerator } from '@/define'
import { stringify } from 'yaml'

export const yamlGenerator = defineGenerator(async (file, message) => {
  const content = stringify(message)

  fs.writeFileSync(file, content, 'utf8')
})
