import type { I18nConfig, I18nLocaleConfig, I18nNamespaceSummary } from '@/types'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadLocaleSummary } from './file'
import { loadLocalMessages, loadLocalNamespaces, loadRemoteMessages, mergeI18nMessagesToLocal, mergeI18nMessagesToRemote } from './messages'

vi.mock('./file', () => ({
  loadLocaleSummary: vi.fn(),
}))

describe('mergeI18nMessagesToLocal', () => {
  const localMessages = {
    en: { hello: 'Hello', world: 'World' },
    fr: { hello: 'Bonjour', world: 'Monde' },
  }
  const remoteMessages = {
    en: { hello: 'Hi', world: 'Earth' },
    fr: { hello: 'Salut', world: 'Terre' },
  }

  beforeEach(() => {
    vi.mock('./config', () => ({
      loadConfig: vi.fn().mockResolvedValue({ defaultLanguage: 'en' }),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should merge messages with remote-first policy by default', async () => {
    const result = await mergeI18nMessagesToLocal(localMessages, remoteMessages)
    expect(result).toEqual({
      en: { hello: 'Hello', world: 'World' },
      fr: { hello: 'Salut', world: 'Terre' },
    })
  })

  it('should merge messages with local-first policy when specified', async () => {
    const result = await mergeI18nMessagesToLocal(localMessages, remoteMessages, 'local-first')
    expect(result).toEqual({
      en: { hello: 'Hello', world: 'World' },
      fr: { hello: 'Bonjour', world: 'Monde' },
    })
  })

  it('should handle nested objects correctly', async () => {
    const nestedLocalMessages = {
      en: { greetings: { hello: 'Hello', goodbye: 'Goodbye' } },
      fr: { greetings: { hello: 'Bonjour', goodbye: 'Au revoir' } },
    }
    const nestedRemoteMessages = {
      en: { greetings: { hello: 'Hi', goodbye: 'Bye' } },
      fr: { greetings: { hello: 'Salut', goodbye: 'À bientôt' } },
    }
    const result = await mergeI18nMessagesToLocal(nestedLocalMessages, nestedRemoteMessages)
    expect(result).toEqual({
      en: { greetings: { hello: 'Hello', goodbye: 'Goodbye' } },
      fr: { greetings: { hello: 'Salut', goodbye: 'À bientôt' } },
    })
  })

  it('should use default language from config', async () => {
    const customLocalMessages = {
      en: { test: 'Test' },
      de: { test: 'Test' },
    }
    const customRemoteMessages = {
      en: { test: 'Remote Test' },
      de: { test: 'Remote Test' },
    }

    const result = await mergeI18nMessagesToLocal(customLocalMessages, customRemoteMessages)
    expect(result).toEqual({
      en: { test: 'Test' },
      de: { test: 'Remote Test' },
    })
  })
})

describe('mergeI18nMessagesToRemote', () => {
  const localMessages = {
    en: { hello: 'Hello', world: 'World' },
    fr: { hello: 'Bonjour', world: 'Monde' },
  }
  const remoteMessages = {
    en: { hello: 'Hi', world: 'Earth' },
    fr: { hello: 'Salut', world: 'Terre' },
  }

  beforeEach(() => {
    vi.mock('./config', () => ({
      loadConfig: vi.fn().mockResolvedValue({ defaultLanguage: 'en' }),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should merge messages to remote correctly', async () => {
    const result = await mergeI18nMessagesToRemote(localMessages, remoteMessages)
    expect(result).toEqual({
      en: { hello: 'Hello', world: 'World' },
      fr: { hello: 'Salut', world: 'Terre' },
    })
  })

  it('should handle nested objects correctly', async () => {
    const nestedLocalMessages = {
      en: { greetings: { hello: 'Hello', goodbye: 'Goodbye' } },
      fr: { greetings: { hello: 'Bonjour', goodbye: 'Au revoir' } },
    }
    const nestedRemoteMessages = {
      en: { greetings: { hello: 'Hi', goodbye: 'Bye' } },
      fr: { greetings: { hello: 'Salut', goodbye: 'À bientôt' } },
    }
    const result = await mergeI18nMessagesToRemote(nestedLocalMessages, nestedRemoteMessages)
    expect(result).toEqual({
      en: { greetings: { hello: 'Hello', goodbye: 'Goodbye' } },
      fr: { greetings: { hello: 'Salut', goodbye: 'À bientôt' } },
    })
  })

  it('should use default language from config and ignore it in merging', async () => {
    const customLocalMessages = {
      en: { test: 'Test' },
      de: { test: 'Test' },
    }
    const customRemoteMessages = {
      en: { test: 'Remote Test' },
      de: { test: 'Remote Test' },
    }
    const result = await mergeI18nMessagesToRemote(customLocalMessages, customRemoteMessages)
    expect(result).toEqual({
      en: { test: 'Test' },
      de: { test: 'Remote Test' },
    })
  })

  it('should handle missing keys in remote messages', async () => {
    const localWithExtra = {
      en: { hello: 'Hello', extra: 'Extra' },
      fr: { hello: 'Bonjour', extra: 'Extra' },
    }
    const remoteWithMissing = {
      en: { hello: 'Hi' },
      fr: { hello: 'Salut' },
    }
    const result = await mergeI18nMessagesToRemote(localWithExtra, remoteWithMissing)
    expect(result).toEqual({
      en: { hello: 'Hello', extra: 'Extra' },
      fr: { hello: 'Salut', extra: undefined },
    })
  })
})

describe('loadLocalNamespaces', () => {
  it('应正确加载本地命名空间', () => {
    const files = ['en.json', 'fr.json']
    const locale = {
      matcher: '{locale}.json',
      path: '/locales',
    } as I18nLocaleConfig

    vi.mocked(loadLocaleSummary).mockImplementation((file) => {
      const [locale] = file.split('.')
      return {
        namespace: 'common',
        locale,
        filename: file,
        ext: '.json',
        basePath: '/locales',
      }
    })

    const result = loadLocalNamespaces(files, locale)

    expect(result).toEqual([
      {
        namespace: 'common',
        summaries: [
          { namespace: 'common', locale: 'en', filename: 'en.json', ext: '.json', basePath: '/locales' },
          { namespace: 'common', locale: 'fr', filename: 'fr.json', ext: '.json', basePath: '/locales' },
        ],
      },
    ] satisfies I18nNamespaceSummary[])
  })

  it('应忽略无效的文件', () => {
    const files = ['en.json', 'invalid.txt']
    const locale = {
      matcher: '{locale}.json',
      path: '/locales',
    } as I18nLocaleConfig

    vi.mocked(loadLocaleSummary).mockImplementation((file) => {
      if (file.endsWith('.json')) {
        const [locale] = file.split('.')
        return {
          namespace: 'common',
          locale,
          filename: file,
          ext: '.json',
          basePath: '/locales',
        }
      }
      return undefined
    })

    const result = loadLocalNamespaces(files, locale)

    expect(result).toEqual([
      {
        namespace: 'common',
        summaries: [
          { namespace: 'common', locale: 'en', filename: 'en.json', ext: '.json', basePath: '/locales' },
        ],
      },
    ] satisfies I18nNamespaceSummary[])
  })
})

describe('loadLocalMessages', () => {
  it('应正确加载本地消息', async () => {
    const namespaceSummary: I18nNamespaceSummary = {
      namespace: 'common',
      summaries: [
        { namespace: 'common', locale: 'en', filename: 'en.json', ext: '.json', basePath: '/locales' },
        { namespace: 'common', locale: 'fr', filename: 'fr.json', ext: '.json', basePath: '/locales' },
      ],
    }
    const locale = {
      path: '/locales',
      matcher: '{locale}.json',
      pull: vi.fn().mockResolvedValue({
        en: { hello: 'Hello' },
        fr: { hello: 'Bonjour' },
      }),
    } as I18nLocaleConfig
    const config: I18nConfig = {
      defaultLanguage: 'en',
      locales: [locale],
      loaders: {
        '.json': vi.fn().mockImplementation((filePath) => {
          const locale = path.basename(filePath, '.json')
          return Promise.resolve({ hello: `Hello in ${locale}` })
        }),
      },
    }

    const result = await loadLocalMessages(namespaceSummary, locale.path, config.loaders)

    expect(result).toEqual({
      en: { hello: 'Hello in en' },
      fr: { hello: 'Hello in fr' },
    })
  })

  it('应在loader未定义时抛出错误', async () => {
    const namespaceSummary: I18nNamespaceSummary = {
      namespace: 'common',
      summaries: [
        {
          namespace: 'common',
          locale: 'en',
          filename: 'en.yaml',
          ext: '.yaml',
          basePath: '/locales',
        },
      ],
    }
    const locale: I18nLocaleConfig = {
      path: '/locales',
      matcher: '{locale}.yaml',
    }
    const config: I18nConfig = {
      defaultLanguage: 'en',
      locales: [locale],
      loaders: {},
    }

    await expect(loadLocalMessages(namespaceSummary, locale.path, config.loaders)).rejects.toThrow('yaml 的loader未定义')
  })
})

describe('loadRemoteMessages', () => {
  it('应正确加载远程消息', async () => {
    const namespaceSummary: I18nNamespaceSummary = {
      namespace: 'common',
      summaries: [
        { namespace: 'common', locale: 'en', filename: 'en.json', ext: '.json', basePath: '/locales' },
        { namespace: 'common', locale: 'fr', filename: 'fr.json', ext: '.json', basePath: '/locales' },
      ],
    }
    const locale: I18nLocaleConfig = {
      path: '/locales',
      matcher: '{locale}.json',
      pull: vi.fn().mockResolvedValue({
        en: { hello: 'Hello' },
        fr: { hello: 'Bonjour' },
      }),
    }
    const config: I18nConfig = {
      defaultLanguage: 'en',
      locales: [locale],
    }

    const result = await loadRemoteMessages(namespaceSummary, locale.pull || config.pull)

    expect(result).toEqual({
      en: { hello: 'Hello' },
      fr: { hello: 'Bonjour' },
    })
    expect(locale.pull).toHaveBeenCalledWith('common', namespaceSummary.summaries)
  })

  it('应在pull未定义时抛出错误', async () => {
    const namespaceSummary: I18nNamespaceSummary = {
      namespace: 'common',
      summaries: [],
    }
    const locale: I18nLocaleConfig = {
      path: '/locales',
      matcher: '{locale}.json',
    }
    const config: I18nConfig = {
      defaultLanguage: 'en',
      locales: [locale],
    }

    await expect(loadRemoteMessages(namespaceSummary, locale.pull || config.pull)).rejects.toThrow('push 时，locale.pull 或 config.pull 未定义')
  })
})
