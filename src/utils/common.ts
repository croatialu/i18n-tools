// 递归获取对象所有的key
export function getObjectAllKeys(
  obj: Record<string, any> = {},
  parentKey = '',
): string[] {
  // 获取对象所有 key
  return Object.keys(obj).flatMap((key) => {
    const value = obj[key]
    const fullKey = parentKey ? `${parentKey}.${key}` : key
    return typeof value === 'object' && value !== null
      ? getObjectAllKeys(value, fullKey)
      : fullKey
  }).sort((a, b) => a.localeCompare(b))
}

export function ensureNotFalsy<T>(obj: T | false | undefined | null, message = ''): T {
  if (!obj)
    throw new Error(`ensureNotFalsy() is falsy: ${message}`)

  return obj
}
