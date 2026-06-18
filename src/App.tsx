import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/common/Layout'
import MapPage from '@/pages/MapPage'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<MapPage />} />
        <Route path="timeline" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
