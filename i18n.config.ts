import { defineConfig } from './src/defineConfig'

export default defineConfig({
  defaultLanguage: 'en',
  pull: async (namespace) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          en: {
            test: `[${namespace}] test`,
          },
        })
      }, 1000)
    })
  },
  push: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 1000)
    })
  },

  locales: [
    {
      path: 'fixtures/locales-1',
      matcher: '{namespace}/{locale}.yml',
    },
    {
      path: 'fixtures/locales-2',
      matcher: '{locale}/{namespace}.yaml',
    },
  ],
})
