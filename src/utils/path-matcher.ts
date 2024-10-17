// Examples
// {namespaces}/{lang}.json
// {lang}/{namespace}/**/*.json
// something/{lang}/{namespace}/**/*.*
export function parsePatchMatcher(pathMatcher: string, ext = ''): RegExp {
  let regStr = pathMatcher
    .replace(/\./g, '\\.')
    .replace('.*', '..*')
    .replace('*\\.', '.*\\.')
    .replace(/\/?\*\*\//g, '(?:.*/|^)')
    .replace('{locale}', '(?<locale>[\\w-_]+)')
    .replace('{locale?}', '(?<locale>[\\w-_]*?)')
    .replace('{namespace}', '(?<namespace>[^/\\\\]+)')
    .replace('{namespace?}', '(?<namespace>[^/\\\\]*?)')
    .replace('{namespaces}', '(?<namespace>.+)')
    .replace('{namespaces?}', '(?<namespace>.*?)')
    .replace('{ext}', `(?<ext>${ext})`)

  regStr = `^${regStr}$`

  return new RegExp(regStr)
}

export function parseLocaleInfo(
  pathMatcher: string,
  exts = '',
): Record<string, string> {
  const regex = parsePatchMatcher(pathMatcher, exts)
  const match = regex.exec(pathMatcher)
  return match?.groups ?? {}
}

export function replaceLocale(filepath: string, pathMatcher: string, locale: string, exts = ''): string {
  let regStr = pathMatcher
    .replace(/\./g, '\\.')
    .replace('.*', '..*')
    .replace('*\\.', '.*\\.')
    .replace(/\/?\*\*\//g, '(?:.*/|^)')
    .replace('{locale}', ')[\\w-_]+(')
    .replace('{namespace}', '(?:[^/\\\\]+)')
    .replace('{namespace?}', '(?:[^/\\\\]*?)')
    .replace('{namespaces}', '(?:.+)')
    .replace('{namespaces?}', '(?:.*?)')
    .replace('{ext}', `(?<ext>${exts})`)

  regStr = `^(${regStr})$`

  return filepath.replace(new RegExp(regStr), `$1${locale}$2`)
}
