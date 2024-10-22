import type { I18nConfig, I18nMessages, I18nNamespaceSummary } from '@/types'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { generateFile, listFiles, listLocaleFiles, loadI18nMessages } from './file'

const fixturesDir = path.join(__dirname, '..', '..', 'fixtures')

describe('listFiles', () => {
  it('应该列出非递归模式下的文件', () => {
    expect(listFiles(fixturesDir, { recursive: false })).toEqual([])
    expect(
      listFiles(path.join(fixturesDir, 'locales-2/en'), { recursive: false }),
    ).toEqual(
      [
        'api-code.yaml',
        'api-config.yaml',
        'api-enum.yaml',
        'base-components.yaml',
        'page.yaml',
        'zod.yaml',
      ],
    )
  })

  it('应该列出递归模式下的所有文件', () => {
    const files = listFiles(path.join(fixturesDir, 'locales-1'), { recursive: true })

    expect(files).toEqual([
      'api-code/en.yml',
      'api-code/ja.yml',
      'api-code/zh-CN.yml',
      'api-code/zh-TW.yml',
      'scene-ui/en.yml',
      'scene-ui/ja.yml',
      'scene-ui/zh-CN.yml',
      'scene-ui/zh-TW.yml',
      'vision/en.yml',
      'vision/ja.yml',
      'vision/zh-CN.yml',
      'vision/zh-TW.yml',
    ])
  })
})

describe('listLocaleFiles', () => {
  it('should list locale files', () => {
    const files = listLocaleFiles(path.join(fixturesDir, 'locales-3'), '{namespace}/{locale}.yml')
    expect(files).toEqual([
      'api-code/en.yml',
      'api-code/ja.yml',
      'api-code/zh-CN.yml',
      'api-code/zh-TW.yml',
      'scene-ui/en.yml',
      'scene-ui/ja.yml',
      'scene-ui/zh-CN.yml',
      'scene-ui/zh-TW.yml',
      'vision/en.yml',
      'vision/ja.yml',
      'vision/zh-CN.yml',
      'vision/zh-TW.yml',
    ])
  })
})

describe('loadI18nMessages', () => {
  it('应该正确加载I18n消息', async () => {
    // const summaries: I18nFileSummary[] = [
    //   {
    //     ext: '.yml',
    //     basePath: '/path/to',
    //     filename: 'common/en.yml',
    //     locale: 'en',
    //     namespace: 'common',
    //   },
    //   {
    //     ext: '.yml',
    //     basePath: '/path/to',
    //     filename: 'common/zh-CN.yml',
    //     locale: 'zh-CN',
    //     namespace: 'common',
    //   },
    // ]

    // expect(mockYmlGenerator).toHaveBeenCalledTimes(2)
    // expect(mockYamlLoader).toHaveBeenCalledWith('/path/to/common/en.yml', summaries[0])
    // expect(mockYamlLoader).toHaveBeenCalledWith('/path/to/common/zh-CN.yml', summaries[1])

    // vi.mocked(loadI18nMessages).mockResolvedValue({
    //   'en': { key: 'value' },
    //   'zh-CN': { key: 'value' },
    // })

    // const messages = await loadI18nMessages(summaries)

    // expect(messages).toEqual({
    //   'en': { key: 'value' },
    //   'zh-CN': { key: 'value' },
    // })

    // expect(mockConfig.loaders['.yml']).toHaveBeenCalledTimes(2)
    // expect(mockConfig.loaders['.yml']).toHaveBeenCalledWith('/path/to/en.yml', summaries[0])
    // expect(mockConfig.loaders['.yml']).toHaveBeenCalledWith('/path/to/zh-CN.yml', summaries[1])
  })

  it('应该在找不到加载器时抛出错误', async () => {
    // const mockConfig = {
    //   loaders: {},
    // }
    // vi.mocked(loadConfig).mockResolvedValue(mockConfig)

    const summaries = [
      {
        ext: '.unknown' as `.${string}`,
        basePath: '/path/to',
        filename: 'en.unknown',
        locale: 'en',
        namespace: 'api-code',
      },
    ]

    await expect(loadI18nMessages(summaries)).rejects.toThrow('Loader for .unknown not found')
  })
})

describe('generateFile', () => {
  it('应该正确生成文件', async () => {
    const namespaceSummary: I18nNamespaceSummary = {
      namespace: 'test',
      summaries: [
        {
          ext: '.json',
          basePath: '/path/to',
          filename: 'en.json',
          locale: 'en',
          namespace: 'test',
        },
        {
          ext: '.json',
          basePath: '/path/to',
          filename: 'zh-CN.json',
          locale: 'zh-CN',
          namespace: 'test',
        },
      ],
    }

    const messages: I18nMessages = {
      'en': { key: 'value' },
      'zh-CN': { key: '值' },
    }

    const mockGenerator = vi.fn()
    const generators: I18nConfig['generators'] = {
      '.json': mockGenerator,
    }

    await generateFile(namespaceSummary, messages, generators)

    expect(mockGenerator).toHaveBeenCalledTimes(2)
    expect(mockGenerator).toHaveBeenCalledWith('/path/to/en.json', { key: 'value' }, namespaceSummary.summaries[0])
    expect(mockGenerator).toHaveBeenCalledWith('/path/to/zh-CN.json', { key: '值' }, namespaceSummary.summaries[1])
  })

  it('应该在generators未定义时抛出错误', async () => {
    const namespaceSummary: I18nNamespaceSummary = {
      namespace: 'test',
      summaries: [],
    }
    const messages: I18nMessages = {}

    await expect(generateFile(namespaceSummary, messages, undefined))
      .rejects
      .toThrow('generators 未定义')
  })

  it('应该在找不到特定扩展名的generator时抛出错误', async () => {
    const namespaceSummary: I18nNamespaceSummary = {
      namespace: 'test',
      summaries: [
        {
          ext: '.unknown',
          basePath: '/path/to',
          filename: 'en.unknown',
          locale: 'en',
          namespace: 'test',
        },
      ],
    }
    const messages: I18nMessages = {
      en: { key: 'value' },
    }
    const generators: I18nConfig['generators'] = {}

    await expect(generateFile(namespaceSummary, messages, generators))
      .rejects
      .toThrow('.unknown 的 generator 未定义')
  })

  it('应该在找不到特定locale的message时抛出错误', async () => {
    const namespaceSummary: I18nNamespaceSummary = {
      namespace: 'test',
      summaries: [
        {
          ext: '.json',
          basePath: '/path/to',
          filename: 'en.json',
          locale: 'en',
          namespace: 'test',
        },
      ],
    }
    const messages: I18nMessages = {}
    const generators: I18nConfig['generators'] = {
      '.json': vi.fn(),
    }

    await expect(generateFile(namespaceSummary, messages, generators))
      .rejects
      .toThrow('en 的 message 未定义')
  })
})
