import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { WorkflowNode } from '@/data/workflows/types'
import { getHighlighter, normalizeLanguage, SUPPORTED_LANGS } from '@/lib/shiki'

/**
 * Extracts per-line inner HTML from Shiki's codeToHtml output.
 * Shiki wraps each line in <span class="line">...</span> — one per newline.
 */
function extractShikiLines(html: string): string[] {
  const codeContent = html.match(/<code>([\s\S]*?)<\/code>/)?.[1] ?? ''
  return codeContent
    .split('\n')
    .filter((line) => line.startsWith('<span class="line">'))
    .map((line) =>
      line.slice('<span class="line">'.length, line.lastIndexOf('</span>')),
    )
}

interface CodePanelProps {
  node: WorkflowNode | null
  hoveredLine: number | null
  onLineHover: (line: number | null) => void
}

export default function CodePanel({ node, hoveredLine, onLineHover }: CodePanelProps) {
  const [lines, setLines] = useState<string[]>([])

  const code = node?.code ?? ''
  const language = node?.language ?? 'text'
  const normalized = normalizeLanguage(language)
  const lang = SUPPORTED_LANGS.has(normalized) ? normalized : null

  useEffect(() => {
    let cancelled = false
    // Microtask defers setState out of the synchronous effect body
    // (required by react-hooks/set-state-in-effect in this repo's ESLint config)
    Promise.resolve().then(async () => {
      if (!node?.code || !lang) {
        setLines([])
        return
      }
      const hl = await getHighlighter()
      if (cancelled) return
      const html = hl.codeToHtml(node.code!, { lang: lang!, theme: 'one-dark-pro' })
      setLines(extractShikiLines(html))
    })
    return () => {
      cancelled = true
    }
  // Re-run when the code string or language changes (new file selected or new topic).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, lang])

  const keyLineNums = new Set(node?.keyLines?.map((kl) => kl.line) ?? [])

  if (!node || node.kind !== 'file' || !node.code) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-neutral-500">
        Select a file to see its code.
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={node.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex h-full flex-col overflow-hidden bg-neutral-950 font-mono"
      >
        {/* macOS-style title bar */}
        <div className="flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-4 py-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="flex-1 text-center text-[11px] text-neutral-500">
            {node.filePath}
          </span>
          <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500">
            {language}
          </span>
        </div>

        {/* Code lines */}
        <div className="overflow-auto p-4 pb-8">
          {lines.length === 0 ? (
            <pre className="text-[13px] leading-6 text-neutral-300">
              <code>{code}</code>
            </pre>
          ) : (
            <div className="text-[13px]">
              {lines.map((lineHtml, i) => {
                const lineNum = i + 1
                const isKeyLine = keyLineNums.has(lineNum)
                const isActive = hoveredLine === lineNum
                const hasDim = hoveredLine !== null && hoveredLine !== lineNum

                return (
                  <div
                    key={i}
                    onMouseEnter={isKeyLine ? () => onLineHover(lineNum) : undefined}
                    onMouseLeave={isKeyLine ? () => onLineHover(null) : undefined}
                    className={`flex transition-opacity duration-100 ${
                      hasDim ? 'opacity-20' : 'opacity-100'
                    } ${isActive ? 'rounded bg-indigo-950/50' : ''}`}
                  >
                    <span className="w-10 shrink-0 select-none pr-4 text-right leading-6 text-neutral-600">
                      {lineNum}
                    </span>
                    {/* Shiki output is from static topic data — safe */}
                    <span
                      className="flex-1 leading-6"
                      dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
