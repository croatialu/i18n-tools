import { merge } from 'lodash-es'
import { jsonGenerator } from './generators/json'
import { yamlGenerator } from './generators/yaml'
import { jsonLoader } from './loaders/json'
import { yamlLoader } from './loaders/yaml'
import type { I18nConfig } from './types'

export function defineConfig(config: I18nConfig): I18nConfig {
  const defaultConfig: Partial<I18nConfig> = {
    generators: {
      json: jsonGenerator,
      yaml: yamlGenerator,
      yml: yamlGenerator,
    },
    loaders: {
      json: jsonLoader,
      yaml: yamlLoader,
      yml: yamlLoader,
    },
  }

  return merge(defaultConfig, config) as I18nConfig
}
