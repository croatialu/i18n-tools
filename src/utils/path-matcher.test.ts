// Examples
// {namespaces}/{lang}.json
// {lang}/{namespace}/**/*.json
// something/{lang}/{namespace}/**/*.*
import { describe, expect, it } from 'vitest'
import { parsePatchMatcher, replaceLocale } from './path-matcher'

describe('parsePathMatcher', () => {
  it('应该正确解析简单的路径匹配器', () => {
    const matcher = '{locale}/{namespace}.json'
    const regex = parsePatchMatcher(matcher)
    expect(regex.test('en/messages.json')).toBe(true)
    expect(regex.test('zh-CN/common.json')).toBe(true)
    expect(regex.test('en/messages/nested.json')).toBe(false)
  })

  it('应该正确处理可选的命名空间', () => {
    const matcher = '{locale}/{namespace?}.json'
    const regex = parsePatchMatcher(matcher)
    expect(regex.test('en/messages.json')).toBe(true)
    expect(regex.test('en.json')).toBe(false)
  })

  it('应该正确处理多级命名空间', () => {
    const matcher = '{locale}/{namespaces}/**/*.json'
    const regex = parsePatchMatcher(matcher)
    expect(regex.test('en/messages/nested/file.json')).toBe(true)
    expect(regex.test('zh-CN/common.json')).toBe(false)
  })

  it('应该正确处理自定义扩展名', () => {
    const matcher = '{locale}/{namespace}.{ext}'
    const regex = parsePatchMatcher(matcher, 'json|yaml')
    expect(regex.test('en/messages.json')).toBe(true)
    expect(regex.test('en/messages.yaml')).toBe(true)
    expect(regex.test('en/messages.txt')).toBe(false)
  })
})

describe('replaceLocale', () => {
  it('应该正确替换路径中的语言代码', () => {
    const matcher = '{locale}/{namespace}.json'
    const filepath = 'en/messages.json'
    const result = replaceLocale(filepath, matcher, 'zh-CN')
    expect(result).toBe('zh-CN/messages.json')
  })

  it('应该正确处理复杂的路径模式', () => {
    const matcher = 'locales/{locale}/{namespaces}/**/*.json'
    const filepath = 'locales/en/common/nested/file.json'
    const result = replaceLocale(filepath, matcher, 'fr')
    expect(result).toBe('locales/fr/common/nested/file.json')
  })

  it('应该正确处理带有自定义扩展名的路径', () => {
    const matcher = '{locale}/{namespace}.{ext}'
    const filepath = 'en/messages.yaml'
    const result = replaceLocale(filepath, matcher, 'de', 'json|yaml')
    expect(result).toBe('de/messages.yaml')
  })
})
