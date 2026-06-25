import type { WebContainer } from '@webcontainer/api'

// Module-level singleton: shared across all LabRunner instances in a session
let wcInstance: WebContainer | null = null
let bootPromise: Promise<WebContainer> | null = null

export function isWebContainerSupported(): boolean {
  return 'SharedArrayBuffer' in window && crossOriginIsolated
}

export async function acquireWebContainer(): Promise<WebContainer | null> {
  if (!isWebContainerSupported()) return null
  if (wcInstance) return wcInstance
  if (bootPromise) return bootPromise
  const { WebContainer } = await import('@webcontainer/api')
  bootPromise = WebContainer.boot().then((wc) => {
    wcInstance = wc
    bootPromise = null
    return wc
  })
  return bootPromise
}

