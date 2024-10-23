import { describe, expect, it } from 'vitest'
import { ensureNotFalsy, getObjectAllKeys, i18nMessagesToList, listToI18nMessages } from './common'

describe('getObjectAllKeys', () => {
  it('应返回空对象的空数组', () => {
    expect(getObjectAllKeys({})).toEqual([])
  })

  it('应返回简单对象的键数组', () => {
    const obj = { a: 1, b: 2, c: 3 }
    expect(getObjectAllKeys(obj)).toEqual(['a', 'b', 'c'])
  })

  it('应返回嵌套对象的键数组', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
      f: 4,
    }
    expect(getObjectAllKeys(obj)).toEqual(['a', 'b.c', 'b.d.e', 'f'])
  })

  it('应按字母顺序排序键', () => {
    const obj = {
      z: 1,
      a: {
        y: 2,
        b: {
          x: 3,
        },
      },
      c: 4,
    }
    expect(getObjectAllKeys(obj)).toEqual(['a.b.x', 'a.y', 'c', 'z'])
  })

  it('应处理空值', () => {
    const obj = {
      a: null,
      b: undefined,
      c: {
        d: null,
      },
    }
    expect(getObjectAllKeys(obj)).toEqual(['a', 'b', 'c.d'])
  })
})

describe('ensureNotFalsy', () => {
  it('应该返回非假值', () => {
    expect(ensureNotFalsy(1)).toBe(1)
    expect(ensureNotFalsy('test')).toBe('test')
    expect(ensureNotFalsy(true)).toBe(true)
    expect(ensureNotFalsy({})).toEqual({})
    expect(ensureNotFalsy([])).toEqual([])
  })

  it('应该在输入假值时抛出错误', () => {
    expect(() => ensureNotFalsy(false)).toThrow('ensureNotFalsy() is falsy: ')
    expect(() => ensureNotFalsy(null)).toThrow('ensureNotFalsy() is falsy: ')
    expect(() => ensureNotFalsy(undefined)).toThrow('ensureNotFalsy() is falsy: ')
    expect(() => ensureNotFalsy(0)).toThrow('ensureNotFalsy() is falsy: ')
    expect(() => ensureNotFalsy('')).toThrow('ensureNotFalsy() is falsy: ')
  })

  it('应该在抛出错误时包含自定义消息', () => {
    const customMessage = '这是一个自定义错误消息'
    expect(() => ensureNotFalsy(false, customMessage)).toThrow(`ensureNotFalsy() is falsy: ${customMessage}`)
  })

  it('应该正确处理边界情况', () => {
    expect(() => ensureNotFalsy(Number.NaN, 'Number.NaN')).toThrow('ensureNotFalsy() is falsy: Number.NaN')
    expect(() => ensureNotFalsy(-0, '-0')).toThrow('ensureNotFalsy() is falsy: -0')
  })
})

describe('i18nMessagesToList', () => {
  it('应正确转换简单的i18n消息对象', () => {
    const messages = {
      en: { hello: 'Hello', world: 'World' },
      zh: { hello: '你好', world: '世界' },
    }
    const result = i18nMessagesToList(messages, 'en')
    expect(result).toEqual([
      { key: 'hello', en: 'Hello', zh: '你好' },
      { key: 'world', en: 'World', zh: '世界' },
    ])
  })

  it('应正确处理嵌套的i18n消息对象', () => {
    const messages = {
      en: { greetings: { hello: 'Hello', goodbye: 'Goodbye' } },
      zh: { greetings: { hello: '你好', goodbye: '再见' } },
    }
    const result = i18nMessagesToList(messages, 'en')
    expect(result).toEqual([
      { key: 'greetings.goodbye', en: 'Goodbye', zh: '再见' },
      { key: 'greetings.hello', en: 'Hello', zh: '你好' },
    ])
  })

  it('当默认语言不存在时应抛出错误', () => {
    const messages = {
      en: { hello: 'Hello' },
      zh: { hello: '你好' },
    }
    expect(() => i18nMessagesToList(messages, 'fr')).toThrow('defaultLanguage fr is not found in messages')
  })

  it('应正确处理缺失的翻译', () => {
    const messages = {
      en: { hello: 'Hello', world: 'World' },
      zh: { hello: '你好' },
    }
    const result = i18nMessagesToList(messages, 'en')
    expect(result).toEqual([
      { key: 'hello', en: 'Hello', zh: '你好' },
      { key: 'world', en: 'World', zh: undefined },
    ])
  })

  it('应按键的字母顺序排序结果', () => {
    const messages = {
      en: { b: 'B', a: 'A', c: 'C' },
      zh: { b: '乙', a: '甲', c: '丙' },
    }
    const result = i18nMessagesToList(messages, 'en')
    expect(result).toEqual([
      { key: 'a', en: 'A', zh: '甲' },
      { key: 'b', en: 'B', zh: '乙' },
      { key: 'c', en: 'C', zh: '丙' },
    ])
  })
})

describe('listToI18nMessages', () => {
  it('应正确转换简单的列表到i18n消息对象', () => {
    const list = [
      { key: 'hello', en: 'Hello', zh: '你好' },
      { key: 'world', en: 'World', zh: '世界' },
    ]
    const result = listToI18nMessages(list)
    expect(result).toEqual({
      en: { hello: 'Hello', world: 'World' },
      zh: { hello: '你好', world: '世界' },
    })
  })

  it('应正确处理嵌套的键', () => {
    const list = [
      { key: 'greetings.hello', en: 'Hello', zh: '你好' },
      { key: 'greetings.goodbye', en: 'Goodbye', zh: '再见' },
    ]
    const result = listToI18nMessages(list)
    expect(result).toEqual({
      en: { greetings: { hello: 'Hello', goodbye: 'Goodbye' } },
      zh: { greetings: { hello: '你好', goodbye: '再见' } },
    })
  })

  it('应正确处理缺失的翻译', () => {
    const list: { key: string, en: string, zh?: string }[] = [
      { key: 'hello', en: 'Hello', zh: '你好' },
      { key: 'world', en: 'World' },
    ]
    const result = listToI18nMessages(list)
    expect(result).toEqual({
      en: { hello: 'Hello', world: 'World' },
      zh: { hello: '你好' },
    })
  })

  it('应正确处理多语言', () => {
    const list = [
      { key: 'greeting', en: 'Hello', zh: '你好', ja: 'こんにちは' },
      { key: 'farewell', en: 'Goodbye', zh: '再见', ja: 'さようなら' },
    ]
    const result = listToI18nMessages(list)
    expect(result).toEqual({
      en: { greeting: 'Hello', farewell: 'Goodbye' },
      zh: { greeting: '你好', farewell: '再见' },
      ja: { greeting: 'こんにちは', farewell: 'さようなら' },
    })
  })

  it('应正确处理深层嵌套的键', () => {
    const list = [
      { key: 'menu.file.new', en: 'New', zh: '新建' },
      { key: 'menu.file.open', en: 'Open', zh: '打开' },
      { key: 'menu.edit.copy', en: 'Copy', zh: '复制' },
    ]
    const result = listToI18nMessages(list)
    expect(result).toEqual({
      en: { menu: { file: { new: 'New', open: 'Open' }, edit: { copy: 'Copy' } } },
      zh: { menu: { file: { new: '新建', open: '打开' }, edit: { copy: '复制' } } },
    })
  })
})
