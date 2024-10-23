# i18n-tools

## 安装

```bash
pnpm add @croatialu/i18n-tools
```

## 使用方法

### CLI 命令

该工具提供以下 CLI 命令:

1. `i18n format` - 格式化本地化数据
2. `i18n pull` - 从远程拉取本地化数据
3. `i18n push` - 将本地化数据推送到远程

每个命令都可以使用 `--dry-run` 选项进行试运行。

### 配置

在项目根目录创建 `i18n.config.ts` 文件进行配置:
``` ts
import { defineConfig } from '@croatialu/i18n-tools'
typescript
export default defineConfig({
  defaultLanguage: 'en',
  locales: [
    {
      path: 'path/to/locales',
      matcher: '{namespace}/{locale}.json',
      ext: '.json'
    }
  ],
  pull: async (namespace, summaries) => {
    // 实现从远程拉取数据的逻辑，返回一个包含所有语言的键值对对象 Record<string /** locale */, I18nMessage>
  },
  push: async (namespace, messages) => {
    // 实现将数据推送到远程的逻辑
  }
})
```

### API

该工具还提供了以下 API 供开发者使用:

- `defineGenerator`: 定义自定义生成器
- `defineLoader`: 定义自定义加载器
- `defineConfig`: 定义配置文件
- `getObjectAllKeys`: 获取对象所有键
- `i18nMessagesToList`: 将 i18n 消息对象转换为列表
- `listToI18nMessages`: 将列表转换为 i18n 消息对象

示例:

``` ts
import { defineConfig, defineGenerator, defineLoader } from '@croatialu/i18n-tools'

// 定义自定义生成器
const myGenerator = defineGenerator(async (
  filename,
  message,
  summary
) => {
// 实现生成逻辑
})
// 定义自定义加载器
const myLoader = defineLoader(async (filename, summary) => {
// 实现加载逻辑
})
// 使用自定义生成器和加载器
export default defineConfig({
// ... 其他配置
  generators: {
    '.custom': myGenerator
  },
  loaders: {
    '.custom': myLoader
  }
})
```

### 加载器
仓库默认支持两种加载器：

- `json` 加载器：支持 JSON 文件的加载
- `yaml` 加载器：支持 YAML 文件的加载

如果需要自定义加载器，可以使用 `defineLoader` 函数进行定义。
### 生成器
仓库默认支持两种生成器：

- `json` 生成器：支持 JSON 文件的生成
- `yaml` 生成器：支持 YAML 文件的生成

如果需要自定义生成器，可以使用 `defineGenerator` 函数进行定义。

### 拉取

当 i18n 文件同步时，会调用 `pull` 函数，该函数接收两个参数：

- `namespace`: 命名空间
- `summaries`: 命名空间下的所有文件摘要

`pull` 函数需要返回一个包含所有语言的键值对对象 Record<string /** locale */, I18nMessage>

你可以自由的使用 api， fs， 或者结合 oss 等其他方式进行拉取存放好的国际化文件数据

### 推送

当 i18n 文件同步时，会调用 `push` 函数，该函数接收两个参数：

- `namespace`: 命名空间
- `messages`: 命名空间下的所有语言的键值对对象 Record<string /** locale */, I18nMessage>

你可以自由的使用 api， fs， 或者结合 oss 等其他方式进行推送国际化文件数据

### 合并策略

仓库默认使用 `remote-first` 合并策略，即优先使用远程拉取的数据，如果远程拉取的数据不存在，则使用本地化文件中的数据。

你可以设置 `defaultLanguage` 来指定默认语言，默认语言不会被远端数据覆盖。

如果想完全的使用远端数据，可以配置  `mergeOptions.policy` 为 `remote-first`。 同时配置 `mergeOptions.freezeDefaultLanguage` 为 `false`，默认语言允许被覆盖。

如果需要使用 `local-first` 合并策略，可以在配置文件中进行设置。

## 方案推荐
defaultLanguage 为默认语言，本地数据 key 的条数和值以 defaultLanguage 为准。
defaultLanguage 只能在本地修改， 其优先级大于远端数据。

非 defaultLanguage 的优先使用远端数据，如果远端数据不存在，则使用本地化文件中的数据。
非 defaultLanguage 的 key 的条数以 defaultLanguage 为准。

其他人员在去做翻译校对时， 只能修改 非 defaultLanguage 的数据，修改完成后，将数据更新到远端。

前端通过工具拉取远端数据， 和本地数据进行合并， 生成新的本地化文件。

前端：修改 key， 增加key， 删除key， 修改 defaultLanguage 的国际化数据。
翻译人员：修改非 defaultLanguage 的国际化数据。

## 开发

1. 克隆仓库
2. 安装依赖: `pnpm install`
3. 运行测试: `pnpm test`
4. 构建项目: `pnpm build`

## 贡献

欢迎提交 Pull Requests 来改进这个项目。对于重大更改,请先开 issue 讨论您想要改变的内容。

请确保适当更新测试。

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

## 许可证

[MIT](./LICENSE) License © 2024-PRESENT [Croatia Lu](https://github.com/croatialu)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@croatialu/i18n-tools?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@croatialu/i18n-tools
[npm-downloads-src]: https://img.shields.io/npm/dm/@croatialu/i18n-tools?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@croatialu/i18n-tools
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@croatialu/i18n-tools?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@croatialu/i18n-tools
[license-src]: https://img.shields.io/github/license/antfu/@croatialu/i18n-tools.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/@croatialu/i18n-tools/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@croatialu/i18n-tools
