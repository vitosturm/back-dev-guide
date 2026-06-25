import type { FileSystemTree } from '@webcontainer/api'

interface LabFallbackProps {
  entryFile: string
  files: FileSystemTree
}

export default function LabFallback({ entryFile, files }: LabFallbackProps) {
  const node = files[entryFile]
  const fileContent =
    node && 'file' in node && 'contents' in node.file && typeof node.file.contents === 'string'
      ? node.file.contents
      : '// File content unavailable'

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 max-w-md">
        <strong>Interactive lab unavailable</strong> — your browser does not support
        SharedArrayBuffer or cross-origin isolation is missing. The lab requires a
        Chromium-based browser with the COOP/COEP headers active.
      </div>
      <div className="w-full max-w-2xl rounded-xl border border-neutral-200 bg-neutral-900 p-4 text-left">
        <p className="mb-2 text-xs text-neutral-500">{entryFile}</p>
        <pre className="overflow-x-auto text-sm text-neutral-200">
          <code>{fileContent}</code>
        </pre>
      </div>
    </div>
  )
}
