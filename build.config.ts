import { defineBuildConfig } from 'unbuild'

const dirname = new URL('.', import.meta.url).pathname
export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  alias: {
    '@/': `${dirname}/src/`,
  },
})
