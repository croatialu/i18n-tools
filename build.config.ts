import path from 'node:path'
import { defineBuildConfig } from 'unbuild'

const dirname = new URL('.', import.meta.url).pathname
export default defineBuildConfig({
  entries: [
    'src/index',
    'src/cli',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  alias: {
    '@': path.join(dirname, 'src'),
  },
  failOnWarn: false,
})
