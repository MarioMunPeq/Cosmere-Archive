/**
 * BiographicalArchivesPage — the thin route shell.
 *
 * Records are Part II of the codex. Bloodlines and Connections still live in
 * the pre-codex shell for one more block; their published URLs keep working
 * rather than redirecting through a different navigation model.
 */

import { useSearchParams } from 'react-router-dom'
import RecordsCodex from '@/components/records/RecordsCodex'
import BiographicalArchivesLegacyPage from '@/pages/BiographicalArchivesLegacyPage'

export default function BiographicalArchivesPage() {
  const [params] = useSearchParams()
  const tab = params.get('tab')
  const legacy = tab === 'bloodlines' || tab === 'connections' || params.has('family')

  return legacy ? <BiographicalArchivesLegacyPage /> : <RecordsCodex />
}
