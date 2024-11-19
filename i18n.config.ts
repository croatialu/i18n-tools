import { defineConfig } from './src/defineConfig'

export default defineConfig({
  defaultLanguage: 'en',
  pull: async (namespace) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            'en': `${namespace} en`,
            'zh-CN': `${namespace} zh-CN`,
            'key': 'test',
            'deletedAt': '2024-01-01 00:00:00',
          },
        ])
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
