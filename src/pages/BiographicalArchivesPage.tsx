/**
 * BiographicalArchivesPage — the thin route shell.
 *
 * Both volumes of the Biographical Archives now live in the codex. The old
 * `?tab=bloodlines`, `?tab=connections` and `?family=` URLs still resolve:
 * `RecordsCodex` chooses Volume II for them, and the codex route rewrites them
 * to a canonical `?spread=` id once the page has rendered.
 */

import RecordsCodex from '@/components/records/RecordsCodex'

export default function BiographicalArchivesPage() {
  return <RecordsCodex />
}
