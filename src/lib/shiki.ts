import type { HighlighterCore } from '@shikijs/core'

let highlighterPromise: Promise<HighlighterCore> | null = null

export function normalizeLanguage(lang: string): string {
  return lang
}

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = Promise.all([
      import('@shikijs/core'),
      import('@shikijs/engine-javascript'),
      import('@shikijs/langs/javascript'),
      import('@shikijs/langs/typescript'),
      import('@shikijs/langs/json'),
      import('@shikijs/themes/one-dark-pro'),
    ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }, langJs, langTs, langJson, theme]) =>
      createHighlighterCore({
        engine: createJavaScriptRegexEngine(),
        themes: [theme.default],
        langs: [langJs.default, langTs.default, langJson.default],
      })
    )
  }
  return highlighterPromise
}

export const SUPPORTED_LANGS = new Set(['javascript', 'typescript', 'json'])
