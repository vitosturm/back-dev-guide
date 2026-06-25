import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import TopicPage from '@/pages/TopicPage'

export default function App() {
  return (
    <BrowserRouter basename="/back-dev-guide">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/topic/ts-intro" replace />} />
          <Route path="topic/:topicId" element={<TopicPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
