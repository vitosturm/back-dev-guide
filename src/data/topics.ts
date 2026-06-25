export interface Topic {
  id: string
  phase: 0 | 1 | 2 | 3 | 4
  title: string
  description: string
  viz?: string    // key in src/topics/registry.ts; undefined = text-only page
  hasLab: boolean
}

// Phase 0 skeleton — individual topic content added per the Phase 0+1 content design doc
export const topics: Topic[] = [
  {
    id: 'ts-types',
    phase: 0,
    title: 'TypeScript Types',
    description: 'Primitive types, type inference, and type annotations',
    hasLab: false,
  },
  {
    id: 'ts-functions',
    phase: 0,
    title: 'Functions & Generics',
    description: 'Typed functions, overloads, and generic type parameters',
    hasLab: true,
  },
  {
    id: 'zod-basics',
    phase: 0,
    title: 'Zod Schemas',
    description: 'Runtime validation with Zod — parse, safeParse, z.infer',
    hasLab: true,
  },
]
