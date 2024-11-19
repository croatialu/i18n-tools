import type { I18nConfig, I18nMessages, I18nNamespaceSummary } from '@/types'
import { loadConfig } from '@/utils/config'
import { generateFile, listLocaleFiles } from '@/utils/file'
import { loadLocalNamespaces, loadRemoteMessages, mergeI18nMessagesToRemote } from '@/utils/messages'
import { describe, expect, it, vi } from 'vitest'
import { push } from './index'

// 模拟依赖模块
vi.mock('@/utils/config')
vi.mock('@/utils/file')
vi.mock('@/utils/messages')
vi.mock('../pull')

describe('push function', () => {
  it('应该正确执行推送流程', async () => {
    // 模拟配置
    const mockConfig: I18nConfig = {
      defaultLanguage: 'en',
      locales: [
        { path: 'path/to/locale', matcher: '{locale}.json', ext: '.json' },
      ],
      generators: {
        '.json': vi.fn(),
      },
      push: vi.fn(),
    }
    vi.mocked(loadConfig).mockResolvedValue(mockConfig)
    vi.mocked(generateFile).mockResolvedValue()

    // 模拟文件列表
    const mockFiles = ['en.json', 'zh.json']
    vi.mocked(listLocaleFiles).mockReturnValue(mockFiles)

    // 模拟命名空间
    const mockNamespaces: I18nNamespaceSummary[] = [{
      namespace: 'namespace1',
      summaries: [
        {
          namespace: 'namespace1',
          locale: 'en',
          filename: 'en.json',
          ext: '.json',
          basePath: 'path/to/locale',
        },
        {
          namespace: 'namespace1',
          locale: 'zh',
          filename: 'zh.json',
          ext: '.json',
          basePath: 'path/to/locale',
        },
      ],
    }]

    vi.mocked(loadLocalNamespaces).mockReturnValue(mockNamespaces)

    // 模拟消息
    const mockRemoteMessages: I18nMessages = [{ key: 'remoteKey', en: 'remoteValue' }]
    const mockMergedMessages: I18nMessages = [{ key: 'mergedKey', en: 'mergedValue' }]
    vi.mocked(loadRemoteMessages).mockResolvedValue(mockRemoteMessages)
    vi.mocked(mergeI18nMessagesToRemote).mockResolvedValue(mockMergedMessages)

    // 执行push函数
    await push()

    // 验证是否正确处理了每个locale
    expect(listLocaleFiles).toHaveBeenCalledWith('path/to/locale', '{locale}.json', '.json')
    expect(loadLocalNamespaces).toHaveBeenCalledWith(mockFiles, mockConfig.locales[0])

    // 验证是否正确处理了每个namespace
    expect(loadRemoteMessages).toHaveBeenCalled()
    // expect(mergeI18nMessagesToRemote).toHaveBeenCalled()
    // expect(mergeI18nMessagesToRemote).toHaveBeenCalledWith(mockMergedMessages, mockRemoteMessages)
    // expect(generateFile).toHaveBeenCalled()
    // expect(generateFile).toHaveBeenCalledWith(mockNamespaces[0], mockMergedMessages, mockConfig.generators)
  })

  // 可以添加更多测试用例，例如错误处理、边界情况等
})
