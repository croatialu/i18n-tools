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
  .description('format locale data')
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
  .description('pull locale data from remote')
  .option('--dry-run', 'dry run', false)
  .option('--force', 'force pull, will delete all local messages', false)
  .action(async (options: { dryRun?: boolean, force?: boolean }) => {
    const config = await loadConfig()
    await pull({
      dryRun: options.dryRun,
      force: options.force,
    })

    if (config.formatter !== false) {
      await format({
        type: config.formatter,
      })
    }
  })

program.command('push')
  .description('push locale data to remote')
  .option('--dry-run', 'dry run', false)
  .option('--force', 'force push, will delete all remote messages', false)
  .action(async (options: { dryRun?: boolean, force?: boolean }) => {
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
