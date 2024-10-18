import { defineConfig } from './src/defineConfig'

export default defineConfig({
  defaultLanguage: 'en',

  locales: [
    {
      path: 'fixtures/locales-1',
      matcher: '{namespace}/{locale}.yml',
      ext: 'yml',
      pull: async (namespace) => {
        console.log(namespace, '2333')
        return {}
      },
    },
    {
      path: 'fixtures/locales-2',
      matcher: '{locale}/{namespace}.yaml',
      ext: 'yaml',
    },
  ],
})
