/**
 * ArcanumRedirect — `/magic` now points at Volume III of the archives.
 *
 * The standalone Ars Arcanum window is gone, but links to it have been
 * published. Preserve its vocabulary: a legacy `?spread=chapter-roshar` becomes
 * `?spread=arcanum-chapter-roshar`, and a legacy `?spread=system-voidbinding`
 * becomes `?system=voidbinding` so the volume can resolve the system to the
 * spread that actually owns it (the right-hand leaf of a two-system spread).
 */

import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { readCodexRibbon } from '@/hooks/useCodexSession'
import { ARCANUM_CONTENTS_ID, toArcanumSpreadId } from '@/utils/arcanum-pages'

export default function ArcanumRedirect() {
  const location = useLocation()
  const [ribbon] = useState(() => readCodexRibbon('investiture'))
  const params = new URLSearchParams(location.search)
  const spread = params.get('spread')

  if (spread) {
    if (spread.startsWith('system-')) {
      params.delete('spread')
      params.set('system', spread.slice('system-'.length))
    } else {
      params.set('spread', toArcanumSpreadId(spread))
    }
  } else if (!params.has('system') && !params.has('character') && !params.has('family')) {
    params.set('spread', ribbon ? toArcanumSpreadId(ribbon) : ARCANUM_CONTENTS_ID)
  }

  const query = params.toString()
  return <Navigate to={`/characters${query ? `?${query}` : ''}`} replace />
}
