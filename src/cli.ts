import { program } from 'commander'
import { description, version } from '../package.json'
import { pull } from './commands/pull'
import { push } from './commands/push'

program
  .name('i18n')
  .version(version)
  .description(description)

program
  .command('pull')
  .option('--dry-run', 'dry run')
  .action(async (options) => {
    await pull({
      dryRun: options.dryRun,
    })
  })

program.command('push')
  .option('--dry-run', 'dry run')
  .action(async (options) => {
    await push({
      dryRun: options.dryRun,
    })
  })

program.parse()
