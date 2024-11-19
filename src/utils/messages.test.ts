import type { I18nConfig, I18nLocaleConfig, I18nMessages, I18nNamespaceSummary } from '@/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadLocaleSummary } from './file'
import { loadLocalNamespaces, loadRemoteMessages, mergeI18nMessagesToLocal, mergeI18nMessagesToRemote } from './messages'

vi.mock('./file', () => ({
  loadLocaleSummary: vi.fn(),
  loadI18nMessages: vi.fn(),
}))

describe('mergeI18nMessagesToLocal', () => {
  const localMessages: I18nMessages = [
    {
      key: 'hello',
      en: 'Hello',
      fr: 'Bonjour',
    },
    {
      key: 'world',
      en: 'World',
      fr: 'Monde',
    },
  ]
  const remoteMessages: I18nMessages = [
    {
      key: 'hello',
      en: 'Hi',
      fr: 'Salut',
      ja: 'こんにちは',
    },
    {
      key: 'world',
      en: 'Earth',
      fr: 'Terre',
      ja: '地球',
    },
  ]

  beforeEach(() => {
    vi.mock('./config', () => ({
      loadConfig: vi.fn().mockResolvedValue({ defaultLanguage: 'en' }),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should merge messages with remote-first policy by default', async () => {
    const result = await mergeI18nMessagesToLocal(localMessages, remoteMessages, 'remote-first')
    expect(result).toEqual([
      { key: 'hello', en: 'Hi', fr: 'Salut', ja: 'こんにちは' },
      { key: 'world', en: 'Earth', fr: 'Terre', ja: '地球' },
    ])
  })

  it('should merge messages with local-first policy when specified', async () => {
    const result = await mergeI18nMessagesToLocal(localMessages, remoteMessages, 'local-first')
    expect(result).toEqual([
      { key: 'hello', en: 'Hello', fr: 'Salut', ja: 'こんにちは' },
      { key: 'world', en: 'World', fr: 'Terre', ja: '地球' },
    ])
  })

  it('should use default language from config', async () => {
    const customLocalMessages: I18nMessages = [
      { key: 'test.a', en: 'Test' },
      { key: 'test.b', de: 'Test' },
    ]
    const customRemoteMessages: I18nMessages = [
      { key: 'test.a', en: 'Remote Test' },
      { key: 'test.b', de: 'Remote Test' },
    ]

    const result = await mergeI18nMessagesToLocal(customLocalMessages, customRemoteMessages)
    expect(result).toEqual([
      { key: 'test.a', en: 'Test' },
      { key: 'test.b', de: 'Remote Test' },
    ])
  })
})

describe('mergeI18nMessagesToRemote', () => {
  const localMessages: I18nMessages = [
    { key: 'hello', en: 'Hello - local', fr: 'Bonjour - local' },
    { key: 'world', en: 'World - local', fr: 'Monde - local' },
  ]
  const remoteMessages: I18nMessages = [
    { key: 'hello', en: 'Hi - remote', fr: 'Salut - remote' },
    { key: 'world', en: 'Earth - remote', fr: 'Terre - remote' },
  ]

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
    expect(result).toEqual([
      { key: 'hello', en: 'Hello - local', fr: 'Salut - remote', deletedAt: undefined },
      { key: 'world', en: 'World - local', fr: 'Terre - remote', deletedAt: undefined },
    ])
  })

  it('should use default language from config and ignore it in merging', async () => {
    const customLocalMessages: I18nMessages = [
      { key: 'hello', en: 'Hello - local', de: 'Hallo - local' },
      { key: 'world', en: 'World - local', de: 'Welt - local' },
    ]
    const customRemoteMessages: I18nMessages = [
      { key: 'hello', en: 'Hi - remote', de: 'Hallo - remote' },
      { key: 'world', en: 'Earth - remote', de: 'Erde - remote' },
    ]
    const result = await mergeI18nMessagesToRemote(customLocalMessages, customRemoteMessages)
    expect(result).toEqual([
      { key: 'hello', en: 'Hello - local', de: 'Hallo - remote', deletedAt: undefined },
      { key: 'world', en: 'World - local', de: 'Erde - remote', deletedAt: undefined },
    ])
  })

  it('should handle missing keys in remote messages', async () => {
    const localWithExtra: I18nMessages = [
      { key: 'hello', en: 'Hello - local', ja: 'こんにちは - local', extra: 'Extra' },
      { key: 'world', en: 'World - local', ja: 'こんにちは - local', extra: 'Extra' },
    ]
    const remoteWithMissing: I18nMessages = [
      { key: 'hello', en: 'Hi - remote', ja: 'こんにちは - remote' },
      { key: 'world', en: 'Salut - remote', ja: 'こんにちは - remote' },
    ]
    const result = await mergeI18nMessagesToRemote(localWithExtra, remoteWithMissing)
    expect(result).toEqual([
      { key: 'hello', en: 'Hello - local', ja: 'こんにちは - remote', deletedAt: undefined },
      { key: 'world', en: 'World - local', ja: 'こんにちは - remote', deletedAt: undefined },
    ])
  })

  it('should handle local messages deletedAt', async () => {
    const localMessages: I18nMessages = [
      { key: 'hello', en: 'Hello - local', zhCN: '你好 - local' },
      { key: 'world', en: 'World - local', zhCN: '世界 - local' },
    ]
    const remoteMessages: I18nMessages = [
      { key: 'extra', en: 'Extra - remote', zhCN: '额外 - remote' },
      { key: 'hello', en: 'Hi - remote', zhCN: '嗨 - remote' },
      { key: 'world', en: 'Salut - remote', zhCN: '你好 - remote' },
    ]

    const result = await mergeI18nMessagesToRemote(localMessages, remoteMessages)
    expect(result).toEqual([
      { key: 'extra', en: 'Extra - remote', zhCN: '额外 - remote', deletedAt: expect.any(String) },
      { key: 'hello', en: 'Hello - local', zhCN: '嗨 - remote', deletedAt: undefined },
      { key: 'world', en: 'World - local', zhCN: '你好 - remote', deletedAt: undefined },
    ])
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
      pull: vi.fn().mockResolvedValue([
        { key: 'hello', en: 'Hello', fr: 'Bonjour' },
      ]),
    }
    const config: I18nConfig = {
      defaultLanguage: 'en',
      locales: [locale],
    }

    const result = await loadRemoteMessages(namespaceSummary, locale.pull || config.pull)

    expect(result).toEqual([
      { key: 'hello', en: 'Hello', fr: 'Bonjour' },
    ])
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
