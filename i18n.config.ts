import { defineConfig } from './src/defineConfig'

export default defineConfig({
  defaultLanguage: 'en',
  pull: async (namespace) => {
    return {
      en: {
        test: `[${namespace}] test`,
      },
    }
  },

  locales: [
    {
      path: 'fixtures/locales-1',
      matcher: '{namespace}/{locale}.yml',
      pull: async (namespace) => {
        return {
          en: {
            test: `[${namespace}] test`,
          },
        }
      },
    },
    {
      path: 'fixtures/locales-2',
      matcher: '{locale}/{namespace}.yaml',
    },
  ],
})
