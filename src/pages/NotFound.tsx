import { Link } from 'react-router-dom'

// NotFound — 404 page shown when no route matches the URL.
export default function NotFound() {
  return (
    <section className="flex flex-col items-center justify-center py-20">
      <h1 className="mb-4 text-6xl font-bold text-purple-400">404</h1>
      <p className="mb-6 text-gray-500">This page does not exist in the Cosmere.</p>
      <Link to="/" className="rounded bg-purple-700 px-4 py-2 text-sm font-medium hover:bg-purple-600">
        Back to the map
      </Link>
    </section>
  )
}
