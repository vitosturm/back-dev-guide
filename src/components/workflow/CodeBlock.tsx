import { useEffect, useState } from 'react'
import { getHighlighter, normalizeLanguage, SUPPORTED_LANGS } from '@/lib/shiki'

interface CodeBlockProps {
  code: string
  language?: string
  label?: string
}

export default function CodeBlock({ code, language = 'text', label }: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)

  const normalized = normalizeLanguage(language)
  const lang = SUPPORTED_LANGS.has(normalized) ? normalized : null

  useEffect(() => {
    if (!lang) return
    let cancelled = false
    getHighlighter().then((hl) => {
      if (cancelled) return
      // Input is static topic data, not user input — safe for dangerouslySetInnerHTML
      setHighlightedHtml(hl.codeToHtml(code, { lang, theme: 'one-dark-pro' }))
    })
    return () => {
      cancelled = true
    }
  }, [code, lang])

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 font-mono">
      <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-3.5 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="flex-1 text-center text-[11px] text-neutral-500">{label ?? ''}</span>
        <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500">
          {language}
        </span>
      </div>
      {lang && highlightedHtml ? (
        // Shiki output is from our own static topic data — not user input
        <div
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          className="shiki-block overflow-x-auto text-[12.5px] leading-relaxed"
        />
      ) : (
        <pre className="overflow-x-auto px-4 py-3.5 text-[12.5px] leading-relaxed text-neutral-300">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}
