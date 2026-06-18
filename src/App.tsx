import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/common/Layout'
import Dashboard from '@/pages/Dashboard'
import Books from '@/pages/Books'
import Characters from '@/pages/Characters'
import CharacterDetail from '@/pages/CharacterDetail'
import Worldhoppers from '@/pages/Worldhoppers'
import NotFound from '@/pages/NotFound'

// App is the root component. It defines all the routes of the application.
// Each <Route> maps a URL path to a page component.
// The Layout component wraps everything with a shared navbar and footer.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="books" element={<Books />} />
        <Route path="characters" element={<Characters />} />
        <Route path="characters/:id" element={<CharacterDetail />} />
        <Route path="worldhoppers" element={<Worldhoppers />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
