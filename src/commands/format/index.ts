import type { I18nFormatter } from '@/types'
import type { Ora } from 'ora'
import path from 'node:path'
import { loadConfig } from '@/utils/config'
import { listLocaleFiles } from '@/utils/file'
import ora from 'ora'
import { x } from 'tinyexec'
import which from 'which'

export interface FormatOptions {
  type?: Exclude<I18nFormatter, false>
}

export async function format({
  type = 'auto',
}: FormatOptions = {}): Promise<void> {
  const config = await loadConfig()

  const spinner = ora('Start formatting').start()
  spinner.info('Start formatting')

  const files = config.locales.map((locale) => {
    const filenames = listLocaleFiles(locale.path, locale.matcher, locale.ext)
    return filenames.map(filename => path.join(locale.path, filename))
  }).flat()

  let result = false

  if (type === 'prettier') {
    result = await execPrettier(spinner, files)
  }
  else if (type === 'eslint') {
    result = await execEslint(spinner, files)
  }
  else {
    result = await execEslint(spinner, files) || await execPrettier(spinner, files)
  }

  if (!result) {
    spinner.fail('no formatter found')
  }
  else {
    spinner.succeed('Formatting completed')
  }
}

async function execPrettier(spinner: Ora, files: string[]): Promise<boolean> {
  spinner.info('Start formatting with prettier')
  const prettierResolvedOrNull = await which('prettier')

  if (prettierResolvedOrNull) {
    await x(prettierResolvedOrNull, ['--write', ...files])
    return true
  }

  return false
}

async function execEslint(spinner: Ora, files: string[]): Promise<boolean> {
  spinner.info('Start formatting with eslint')
  const eslintResolvedOrNull = await which('eslint')
  if (eslintResolvedOrNull) {
    await x(eslintResolvedOrNull, ['--fix', ...files])
    return true
  }

  return false
}
