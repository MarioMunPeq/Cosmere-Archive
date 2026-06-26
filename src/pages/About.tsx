import { Link } from 'react-router-dom'
import PageLayout from '@/components/ui/PageLayout'

export default function About() {
  return (
    <PageLayout variant="center">
      <div className="max-w-lg animate-fade-in-up">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-purple-400 transition-colors hover:text-purple-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to the map
        </Link>

        <h1 className="text-3xl font-bold text-gray-100">About</h1>

        <p className="mt-4 leading-relaxed text-gray-400">
          This is an interactive visual encyclopedia of the <strong className="text-gray-300">Cosmere</strong>, the
          shared universe of Brandon Sanderson's fantasy novels.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-200">Features</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-purple-400">*</span>
            Interactive map of known Cosmere planets with zoom and pan
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-purple-400">*</span>
            Planet detail panels with character and worldhopper information
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-purple-400">*</span>
            Worldhopper travel route visualization
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-purple-400">*</span>
            Shard filter -- highlight planets by invested Shard
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-purple-400">*</span>
            Global search across planets, characters, events, books, and worldhoppers
          </li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-gray-200">Data Sources</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-purple-400">*</span>
            <a
              href="https://coppermind.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 underline decoration-purple-800 underline-offset-2 hover:text-purple-300"
            >
              The Coppermind
            </a>
            -- Cosmere wiki for character and planet data
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-purple-400">*</span>
            <a
              href="https://www.brandonsanderson.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 underline decoration-purple-800 underline-offset-2 hover:text-purple-300"
            >
              Brandon Sanderson's website
            </a>
            -- official book information
          </li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-gray-200">Technical</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Built with React 19, TypeScript 6, Vite 8, Tailwind CSS v4, and React Router 7. All data is static -- no
          backend or database required.
        </p>

        <div className="mt-8 border-t border-gray-800 pt-6 text-sm text-gray-600">
          <Link to="/" className="text-purple-400 hover:text-purple-300">
            &larr; Back to the Cosmere Map
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
