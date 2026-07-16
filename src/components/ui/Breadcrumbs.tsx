import { useLocation, Link } from 'react-router-dom'
import { getBookById } from '@/data/static'

const SEGMENT_NAMES: Record<string, string> = {
  '': 'Map',
  about: 'About',
  relationships: 'Relationships',
  characters: 'Characters',
  magic: 'Ars Arcanum',
  aharietiam: 'Aharietiam',
  books: 'Books',
  stats: 'Taravangian Diagram',
  chronology: 'Chronology',
  locations: 'Locations',
  shadesmar: 'Shadesmar',
}

type Crumb = { label: string; to: string }

function buildCrumbs(segments: string[]): Crumb[] {
  const crumbs: Crumb[] = []
  let accumulated = ''

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (!seg) continue
    accumulated += `/${seg}`

    if (i === 0) {
      crumbs.push({ label: SEGMENT_NAMES[seg] ?? seg, to: accumulated })
      continue
    }

    if (i === segments.length - 1 && segments.length === 2 && segments[0] === 'books') {
      const book = getBookById(seg)
      if (book) {
        crumbs.push({ label: book.title, to: accumulated })
        continue
      }
    }

    crumbs.push({ label: SEGMENT_NAMES[seg] ?? seg.replace(/-/g, ' '), to: accumulated })
  }

  return crumbs
}

export default function Breadcrumbs() {
  const { pathname } = useLocation()
  if (pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)
  const crumbs = buildCrumbs(segments)

  if (crumbs.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-2 px-4 pt-2 sm:px-6">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
        {crumbs.map((crumb, i) => (
          <li key={crumb.to} className="flex items-center gap-1">
            {i > 0 && <span className="select-none">/</span>}
            {i < crumbs.length - 1 ? (
              <Link to={crumb.to} className="transition-colors hover:text-purple-400">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-300" aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
