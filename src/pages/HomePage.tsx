import { projectMapRoot } from '@/data/projectMap'
import ProjectTree from '@/components/projectmap/ProjectTree'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">
        What does a real backend look like?
      </h1>
      <p className="mb-6 text-neutral-600">
        Click any file or folder below to jump to the lesson that teaches it.
      </p>
      <ProjectTree root={projectMapRoot} />
    </div>
  )
}
