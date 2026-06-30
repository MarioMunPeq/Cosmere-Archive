import { useNavigate } from 'react-router-dom'
import BackToMapButton from '@/components/ui/BackToMapButton'
import { useSEOMeta } from '@/hooks/useSEOMeta'

export default function NotFound() {
  useSEOMeta({ title: '404 — Cosmere Archive', description: 'Page not found — Cosmere Archive' })
  const navigate = useNavigate()
  return (
    <section className="flex flex-col items-center justify-center py-20">
      <h1 className="mb-4 text-6xl font-bold text-purple-400">404</h1>
      <p className="mb-6 text-gray-500">This page does not exist in the Cosmere.</p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-300"
        >
          Go back
        </button>
        <BackToMapButton variant="button" />
      </div>
    </section>
  )
}
