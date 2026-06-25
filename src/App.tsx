import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import TopicPage from '@/pages/TopicPage'
import LabPage from '@/pages/LabPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/topic/ts-intro" replace />} />
          <Route path="topic/:topicId" element={<TopicPage />} />
          <Route path="lab/:topicId" element={<LabPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
