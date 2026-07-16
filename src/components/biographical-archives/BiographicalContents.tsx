import { ALL_CHARACTERS } from '@/data/static'
import { CHARACTER_RELATIONSHIPS } from '@/data/static/static-data'
import { FAMILY_TREES } from '@/data/static/family-data'

interface Props {
  onSelectChapter: (chapter: 'records' | 'bloodlines' | 'connections') => void
}

const CHAPTERS: {
  id: 'records' | 'bloodlines' | 'connections'
  title: string
  description: string
  numeral: string
  folio: string
  countLabel: string
}[] = [
  {
    id: 'records',
    title: 'Character Records',
    description: 'Individual biographical records of notable figures throughout the Cosmere.',
    numeral: 'I',
    folio: 'Fol. 25\u201327',
    countLabel: `${ALL_CHARACTERS.length} entries`,
  },
  {
    id: 'bloodlines',
    title: 'Bloodlines',
    description: 'Genealogical charts documenting the principal dynasties and family lines.',
    numeral: 'II',
    folio: 'Fol. 28\u201330',
    countLabel: `${FAMILY_TREES.length} dynasties`,
  },
  {
    id: 'connections',
    title: 'Connections',
    description: 'Diagrams of associations, allegiances and relationships between historical figures.',
    numeral: 'III',
    folio: 'Fol. 31\u201332',
    countLabel: `${CHARACTER_RELATIONSHIPS.length} recorded relations`,
  },
]

export default function BiographicalContents({ onSelectChapter }: Props) {
  return (
    <div>
      <h2 className="font-serif text-xs uppercase tracking-[0.15em] mb-5" style={{ color: 'rgba(80,60,40,0.35)' }}>
        Contents
      </h2>
      <div className="space-y-[3px]">
        {CHAPTERS.map((ch) => (
          <span
            key={ch.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectChapter(ch.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectChapter(ch.id)
              }
            }}
            className="flex items-baseline gap-2 cursor-pointer group"
          >
            <span className="font-serif text-[11px] min-w-[22px] text-right" style={{ color: 'rgba(80,60,40,0.25)' }}>
              {ch.numeral}.
            </span>
            <span
              className="font-serif text-sm tracking-[0.02em] transition-opacity group-hover:opacity-60"
              style={{ color: '#2d1a0e' }}
            >
              {ch.title}
            </span>
            <span className="flex-1 min-w-[12px]" style={{ borderBottom: '1px dotted rgba(80,60,40,0.08)' }} />
            <span className="font-serif text-[10px]" style={{ color: 'rgba(80,60,40,0.2)' }}>
              {ch.folio}
            </span>
          </span>
        ))}
      </div>
      <p className="font-serif text-[9px] italic mt-6" style={{ color: 'rgba(80,60,40,0.15)' }}>
        Volume compiled from records preserved within the Silverlight Archives.
      </p>
    </div>
  )
}
