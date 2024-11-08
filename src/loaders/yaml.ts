import fs from 'node:fs'
import { defineLoader } from '@/define'
import { parse } from 'yaml'

export const yamlLoader = defineLoader(async (file) => {
  const content = fs.readFileSync(file, 'utf8')

  return parse(content)
})
