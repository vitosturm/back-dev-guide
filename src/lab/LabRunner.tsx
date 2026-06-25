import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import type { WebContainer, FileSystemTree } from '@webcontainer/api'
import { acquireWebContainer, isWebContainerSupported, mountAndRun } from './useWebContainer'
import LabFallback from './LabFallback'

interface LabRunnerProps {
  starterFiles: FileSystemTree
  entryFile: string  // path within the WebContainer FS to load in Monaco, e.g. 'src/index.ts'
}

export default function LabRunner({ starterFiles, entryFile }: LabRunnerProps) {
  const termRef = useRef<HTMLDivElement>(null)
  const wcRef = useRef<WebContainer | null>(null)
  // Capture initial props in refs so the boot effect doesn't re-run on prop changes
  const starterFilesRef = useRef(starterFiles)
  const entryFileRef = useRef(entryFile)

  const [supported] = useState(isWebContainerSupported)
  const [booting, setBooting] = useState(true)
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!supported) return

    const term = new Terminal({ convertEol: true, fontSize: 13 })
    const fit = new FitAddon()
    term.loadAddon(fit)

    if (termRef.current) {
      term.open(termRef.current)
      fit.fit()
    }

    let cancelled = false

    async function boot() {
      const wc = await acquireWebContainer()
      if (cancelled || !wc) return
      wcRef.current = wc
      await mountAndRun(wc, starterFilesRef.current, 'node', ['--version'], term)
      const initial = await wc.fs.readFile(entryFileRef.current, 'utf-8').catch(() => '')
      if (!cancelled) {
        setCode(initial)
        setBooting(false)
      }
    }

    boot()

    return () => {
      cancelled = true
      term.dispose()
    }
    // Empty deps: intentional — this effect boots the WebContainer once per mount.
    // starterFilesRef and entryFileRef are stable refs, not reactive values.
  }, [supported])

  if (!supported) {
    return <LabFallback files={starterFiles} entryFile={entryFile} />
  }

  async function handleEditorChange(value: string | undefined) {
    if (value === undefined || !wcRef.current) return
    setCode(value)
    await wcRef.current.fs.writeFile(entryFileRef.current, value)
  }

  return (
    <div className="grid h-full grid-rows-[1fr_200px]">
      {booting ? (
        <div className="flex items-center justify-center text-sm text-neutral-400">
          Booting WebContainer…
        </div>
      ) : (
        <Editor
          language="typescript"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
          theme="vs-dark"
        />
      )}
      <div ref={termRef} className="bg-neutral-900" />
    </div>
  )
}
