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
    <div className="max-w-[400px]">
      <h2
        className="font-serif text-[14px] uppercase tracking-[0.18em] mb-8 font-bold"
        style={{ color: 'rgba(60,45,30,0.45)' }}
      >
        Contents
      </h2>
      <div className="space-y-[6px]">
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
            className="flex items-baseline gap-3 cursor-pointer group"
          >
            <span
              className="font-serif text-[12px] font-medium min-w-[24px] text-right"
              style={{ color: 'rgba(80,60,40,0.25)' }}
            >
              {ch.numeral}.
            </span>
            <span
              className="font-serif text-[18px] tracking-[0.02em] transition-opacity group-hover:opacity-60"
              style={{ color: '#2d1a0e' }}
            >
              {ch.title}
            </span>
            <span className="flex-1 min-w-[12px]" style={{ borderBottom: '1px dotted rgba(80,60,40,0.08)' }} />
            <span className="font-serif text-[11px]" style={{ color: 'rgba(80,60,40,0.22)' }}>
              {ch.folio}
            </span>
          </span>
        ))}
      </div>
      <div className="mt-6 pt-4 space-y-2" style={{ borderTop: '1px solid rgba(80,60,40,0.04)' }}>
        <p className="font-serif text-[11px] leading-relaxed" style={{ color: 'rgba(80,60,40,0.2)' }}>
          Volume compiled from records preserved within the Silverlight Archives.
        </p>
        <p className="font-serif text-[10px] italic" style={{ color: 'rgba(80,60,40,0.12)' }}>
          Fol. 25–32 · Biographical Series · Approved for reference
        </p>
      </div>
    </div>
  )
}
