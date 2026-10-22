/**
 * MagicSystemsPage — the legacy /magic surface.
 *
 * The Ars Arcanum is now Volume III of the Biographical Archives. The router
 * sends `/magic` into the third volume, so readers no longer see a separate
 * window. This wrapper remains as the standalone renderer for direct imports
 * (and for the book's unit surface), using the unprefixed spread ids the old
 * page published.
 */

import { useSEOMeta } from '@/hooks/useSEOMeta'
import ArcanumCodex from '@/components/records/ArcanumCodex'

export default function MagicSystemsPage() {
  useSEOMeta({
    title: 'Ars Arcanum — Cosmere Archive',
    description: 'Collected observations concerning the manifestations of Investiture throughout the known Cosmere.',
  })

  return <ArcanumCodex />
}
