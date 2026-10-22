/**
 * VolumeSwitcher — the two leather bookmarks that sit above the open codex.
 *
 * The Biographical Archives are one desk with two volumes. At the desk both
 * volumes are closed and the reader chooses a cover; once one is open, these
 * tabs keep the other volume one click away instead of forcing a trip back to
 * the library. They are deliberately physical: brass lettering on dark leather,
 * not a floating application toolbar.
 */

export type ArchiveVolume = 'records' | 'lineages'

export const VOLUME_DETAILS: Record<
  ArchiveVolume,
  { numeral: string; title: string; shortTitle: string; meta: string }
> = {
  records: {
    numeral: 'I',
    title: 'Biographical Records',
    shortTitle: 'Records',
    meta: '93 lives · 8 ranges',
  },
  lineages: {
    numeral: 'II',
    title: 'Bloodlines & Connections',
    shortTitle: 'Bloodlines',
    meta: '7 houses · 25 people',
  },
}

interface Props {
  current: ArchiveVolume
  onOpen: (volume: ArchiveVolume) => void
  onAllVolumes: () => void
}

export default function VolumeSwitcher({ current, onOpen, onAllVolumes }: Props) {
  const volumes: ArchiveVolume[] = ['records', 'lineages']

  return (
    <nav className="codex-volumes" aria-label="Archive volumes" data-codex-interactive>
      <span className="codex-volumes__label" aria-hidden="true">
        Volumes
      </span>
      {volumes.map((volume) => {
        const details = VOLUME_DETAILS[volume]
        const active = volume === current
        return (
          <button
            key={volume}
            type="button"
            className="codex-volumes__tab"
            data-active={active ? 'true' : 'false'}
            aria-current={active ? 'page' : undefined}
            aria-label={`Volume ${details.numeral}: ${details.title}${active ? ' — open' : ''}`}
            onClick={() => onOpen(volume)}
          >
            <span className="codex-volumes__numeral" aria-hidden="true">
              {details.numeral}
            </span>
            <span className="codex-volumes__title">
              <span className="codex-volumes__long">{details.shortTitle}</span>
            </span>
          </button>
        )
      })}
      <button type="button" className="codex-volumes__all" aria-label="All volumes" onClick={onAllVolumes}>
        All
      </button>
    </nav>
  )
}
