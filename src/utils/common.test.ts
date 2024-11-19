import { describe, expect, it } from 'vitest'
import { ensureNotFalsy, getObjectAllKeys } from './common'

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
