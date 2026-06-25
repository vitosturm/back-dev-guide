import { Outlet } from 'react-router-dom'
import PhaseNav from './PhaseNav'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <aside className="w-60 shrink-0 overflow-y-auto border-r border-neutral-200 bg-neutral-50">
        <PhaseNav />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
