import type React from 'react'

type VizModule = { default: React.FC }

// Maps a topic's `viz` string to a lazy import of its visualization component.
// Register new Viz components here as phase content is built out.
// Example: TsTypesViz: () => import('@/components/viz/TsTypesViz'),
const registry: Record<string, () => Promise<VizModule>> = {}

export default registry
