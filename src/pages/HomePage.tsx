import LifecycleMap from '@/components/lifecycle/LifecycleMap'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">
          What does a real backend look like?
        </h1>
        <p className="text-neutral-600">
          A request enters at the top and travels through each layer. Click any
          file to see what it does and how it fits in.
        </p>
      </div>
      <LifecycleMap />
    </div>
  )
}
