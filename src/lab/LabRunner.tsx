import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import type { WebContainer, FileSystemTree } from '@webcontainer/api'
import { acquireWebContainer, isWebContainerSupported } from './useWebContainer'
import LabFallback from './LabFallback'

interface LabRunnerProps {
  starterFiles: FileSystemTree
  entryFile: string       // path within WebContainer FS to open in Monaco
  runScript?: string      // package.json script name to run after install (default: 'dev')
}

export default function LabRunner({
  starterFiles,
  entryFile,
  runScript = 'dev',
}: LabRunnerProps) {
  const termRef = useRef<HTMLDivElement>(null)
  const wcRef = useRef<WebContainer | null>(null)

  // Capture initial props in refs so the boot effect only runs once per mount
  const starterFilesRef = useRef(starterFiles)
  const entryFileRef = useRef(entryFile)
  const runScriptRef = useRef(runScript)

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

      // Mount starter files
      await wc.mount(starterFilesRef.current)

      // Install dependencies
      term.writeln('\x1b[36m📦 Installing dependencies...\x1b[0m')
      const install = await wc.spawn('npm', ['install'])
      install.output.pipeTo(
        new WritableStream({ write: (data) => term.write(data) }),
      )
      await install.exit

      // Read entry file for Monaco
      const initial = await wc.fs
        .readFile(entryFileRef.current, 'utf-8')
        .catch(() => '')
      if (cancelled) return
      setCode(initial)
      setBooting(false)

      // Run the dev script
      term.writeln('\x1b[32m▶ Running npm run ' + runScriptRef.current + '...\x1b[0m')
      const proc = await wc.spawn('npm', ['run', runScriptRef.current])
      proc.output.pipeTo(
        new WritableStream({ write: (data) => term.write(data) }),
      )

      // Make terminal interactive — pipe xterm input to the process
      const writer = proc.input.getWriter()
      term.onData((data) => { void writer.write(data) })
    }

    boot()

    return () => {
      cancelled = true
      term.dispose()
    }
    // Empty deps: intentional — boots once per mount.
    // starterFilesRef, entryFileRef, runScriptRef are stable refs, not reactive values.
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
