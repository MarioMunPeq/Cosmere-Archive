/**
 * DestinationIcon — maps the `icon` name on a Destination to a glyph.
 *
 * Kept separate from primitives/Icon so the navigation registry can stay a
 * plain data module. A .ts file that exports React nodes would have to become
 * .tsx, and this registry is imported by the search index generator, which runs
 * outside the app.
 */

import Icon from '@/components/primitives/Icon'
import type { ReactNode } from 'react'
import type { IconName } from '@/navigation'

const PATHS: Record<IconName, ReactNode> = {
  book: (
    <>
      <path d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 0-3 3z" />
      <path d="M17 7.5h2v12H8" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="9" r="3.4" />
      <path d="M5.5 20c0-3.6 2.9-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
    </>
  ),
  waves: (
    <>
      <path d="M3 8.5c2-2 3.5-2 5.5 0s3.5 2 5.5 0 3.5-2 5.5 0" />
      <path d="M3 13c2-2 3.5-2 5.5 0s3.5 2 5.5 0 3.5-2 5.5 0" />
      <path d="M3 17.5c2-2 3.5-2 5.5 0s3.5 2 5.5 0 3.5-2 5.5 0" />
    </>
  ),
  shard: (
    <>
      <path d="M12 3l6 5.5-2.2 11h-7.6L6 8.5z" />
      <path d="M12 3v16.5" />
    </>
  ),
  herald: (
    <>
      <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z" />
      <path d="M12 8.5v6M9.5 11.5h5" />
    </>
  ),
  magic: (
    <>
      <path d="M12 3l1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  ),
  event: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5.4l3.4 2" />
    </>
  ),
  diagram: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5.5" cy="18" r="2.2" />
      <circle cx="18.5" cy="18" r="2.2" />
      <path d="M12 7.2v4.3M10.6 12.8l-3.6 3.4M13.4 12.8l3.6 3.4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  compare: (
    <>
      <path d="M12 4v16" />
      <path d="M5 8H3l3-4 3 4H7" />
      <path d="M19 16h-2l3 4 3-4h-2" />
    </>
  ),
  planet: (
    <>
      <circle cx="12" cy="12" r="6" />
      <ellipse cx="12" cy="12" rx="10.5" ry="3.6" transform="rotate(-18 12 12)" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  chevron: <path d="M6 9.5l6 6 6-6" />,
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-6.5 8 6.5" />
      <path d="M6 10v9h12v-9" />
    </>
  ),
}

interface Props {
  name: IconName
  size?: number
  className?: string
}

export default function DestinationIcon({ name, size = 24, className = '' }: Props) {
  return (
    <Icon size={size} className={className}>
      {PATHS[name]}
    </Icon>
  )
}

export { PATHS as ICON_PATHS }
