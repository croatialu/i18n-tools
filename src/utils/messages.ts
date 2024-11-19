import type { I18nConfig, I18nFileSummary, I18nLocaleConfig, I18nMergePolicy, I18nMessage, I18nMessages, I18nNamespaceSummary } from '@/types'
import { compact, isEmpty, omit, uniq } from 'lodash-es'
import { loadConfig } from './config'
import { loadLocaleSummary } from './file'

function getOperationType(hasLocalMessage: boolean, hasRemoteMessage: boolean): 'add' | 'update' | 'delete' {
  if (hasLocalMessage && hasRemoteMessage) {
    return 'update' as const
  }
  else if (hasLocalMessage && !hasRemoteMessage) {
    // 本地有， 远端无， 则为新增
    return 'add' as const
  }
  else if (!hasLocalMessage && hasRemoteMessage) {
    // 本地无， 远端有， 则为删除
    return 'delete' as const
  }

  throw new Error('非预期结果')
}

export async function mergeI18nMessagesToLocal(
  localMessages: I18nMessages,
  remoteMessages: I18nMessages,
  policy: I18nMergePolicy = 'local-first',
): Promise<I18nMessages> {
  const config = await loadConfig()

  const allKeys = compact(uniq(
    [
      ...localMessages.map(v => v.key),
      ...remoteMessages.map(v => v.key),
    ],
  )).sort()

  const newMessageMapping: Record<string, I18nMessage> = {}

  const localMessageMapping = localMessages.reduce((acc, message) => {
    acc[message.key] = message
    return acc
  }, {} as Record<string, I18nMessage>)

  const remoteMessageMapping = remoteMessages.reduce((acc, message) => {
    acc[message.key] = message
    return acc
  }, {} as Record<string, I18nMessage>)

  allKeys.forEach((key) => {
    const localMessage = localMessageMapping[key] || {}
    const remoteMessage = remoteMessageMapping[key] || {}
    const keys = uniq([
      ...Object.keys(omit(localMessage, 'deletedAt', 'key')),
      ...Object.keys(omit(remoteMessage, 'deletedAt', 'key')),
    ])

    const transition = keys.reduce((acc, key) => {
      acc[key] = remoteMessage[key] || localMessage[key]
      return acc
    }, {} as Record<string, any>)

    const localValue = localMessage[config.defaultLanguage]
    const remoteValue = remoteMessage[config.defaultLanguage]

    newMessageMapping[key] = {
      ...transition,
      key,
      [config.defaultLanguage]:
        policy === 'local-first' ? (localValue || remoteValue) : (remoteValue || localValue),
    }
  })

  return allKeys.map(key => newMessageMapping[key])
}

export async function mergeI18nMessagesToRemote(
  localMessages: I18nMessages,
  remoteMessages: I18nMessages,
): Promise<I18nMessages> {
  const config = await loadConfig()

  const allKeys = compact(uniq(
    [
      ...localMessages.map(v => v.key),
      ...remoteMessages.map(v => v.key),
    ],
  )).sort()

  const newMessageMapping: Record<string, I18nMessage> = {}

  const localMessageMapping = localMessages.reduce((acc, message) => {
    acc[message.key] = message
    return acc
  }, {} as Record<string, I18nMessage>)

  const remoteMessageMapping = remoteMessages.reduce((acc, message) => {
    acc[message.key] = message
    return acc
  }, {} as Record<string, I18nMessage>)

  allKeys.forEach((key) => {
    const localMessage = localMessageMapping[key] || {}
    const remoteMessage = remoteMessageMapping[key] || {}
    const keys = uniq([
      ...Object.keys(omit(localMessage, 'deletedAt', 'key')),
      ...Object.keys(omit(remoteMessage, 'deletedAt', 'key')),
    ])
    const transition = keys.reduce((acc, key) => {
      acc[key] = remoteMessage[key]
      return acc
    }, {} as Record<string, any>)
    const type = remoteMessage.deletedAt ? 'delete' : getOperationType(!isEmpty(localMessage), !isEmpty(remoteMessage))

    newMessageMapping[key] = {
      ...transition,
      key,
      // 删除时， 使用远端语言的值
      [config.defaultLanguage]: type === 'delete' ? remoteMessage[config.defaultLanguage] : localMessage[config.defaultLanguage],
      deletedAt: type === 'delete' ? new Date().toISOString() : undefined,
    }
  })

  return allKeys.map(key => newMessageMapping[key])
}

export function loadLocalNamespaces(files: string[], locale: I18nLocaleConfig): I18nNamespaceSummary[] {
  const namespaceMapping: Record<string, I18nFileSummary[]> = {}

  files.forEach((file) => {
    const summary = loadLocaleSummary(file, locale.matcher)
    if (!summary)
      return
    namespaceMapping[summary.namespace] = [
      ...(namespaceMapping[summary.namespace] || []),
      { ...summary, filename: file, basePath: locale.path },
    ]
  })

  return Object.entries(namespaceMapping)
    .map(([namespace, summaries]) => ({ namespace, summaries }))
}

export async function loadRemoteMessages(
  namespaceSummary: I18nNamespaceSummary,
  pull: I18nConfig['pull'],
): Promise<I18nMessages> {
  const { namespace, summaries } = namespaceSummary

  if (!pull) {
    throw new Error('push 时，locale.pull 或 config.pull 未定义')
  }

  const messages = await pull(namespace, summaries)

  return messages.toSorted((a, b) => a.key.localeCompare(b.key))
}
