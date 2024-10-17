import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { listFiles, listLocaleFiles } from './file'

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
