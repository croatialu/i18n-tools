import { program } from 'commander'
import { description, version } from '../package.json'
import { format } from './commands/format'
import { pull } from './commands/pull'
import { push } from './commands/push'
import { loadConfig } from './utils/config'

program
  .name('i18n')
  .version(version)
  .description(description)

program
  .command('format')
  .action(async () => {
    const config = await loadConfig()

    if (config.formatter !== false) {
      await format({
        type: config.formatter,
      })
    }
    else {
      console.error('please set formatter in config')
    }
  })

program
  .command('pull')
  .option('--dry-run', 'dry run')
  .action(async (options) => {
    const config = await loadConfig()
    await pull({
      dryRun: options.dryRun,
    })

    if (config.formatter !== false) {
      await format({
        type: config.formatter,
      })
    }
  })

program.command('push')
  .option('--dry-run', 'dry run')
  .action(async (options) => {
    const config = await loadConfig()

    // PUSH 前， 先拉取远程数据更新本地
    await pull({
      dryRun: options.dryRun,
    })

    if (config.formatter !== false) {
      await format({
        type: config.formatter,
      })
    }

    await push({
      dryRun: options.dryRun,
    })
  })

program.parse()
