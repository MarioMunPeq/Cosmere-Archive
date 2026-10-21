/**
 * ComparePage — two records laid side by side on a desk.
 *
 * ## Diegetic treatment
 *
 * A comparison is not a table. It is two open records on a desk, with a brass
 * balance between them. The reader picks two names from a card catalogue and
 * the records open on the desk, facing each other.
 */
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ALL_CHARACTERS, PLANETS, BOOKS, SAGA_BY_ID } from '@/data/static'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import BackToMapButton from '@/components/ui/BackToMapButton'

const ATTRS: {
  label: string
  getValue: (c: (typeof ALL_CHARACTERS)[number]) => string
}[] = [
  {
    label: 'Planet',
    getValue: (c) => PLANETS.find((p) => p.id === c.planet)?.name ?? c.planet,
  },
  {
    label: 'Saga',
    getValue: (c) => {
      const sagaId = BOOKS.find((b) => c.requiredBooks.includes(b.id))?.saga
      return sagaId ? (SAGA_BY_ID.get(sagaId)?.name ?? sagaId) : '—'
    },
  },
  {
    label: 'Books',
    getValue: (c) => c.requiredBooks.map((id) => BOOKS.find((b) => b.id === id)?.title ?? id).join(', ') || '—',
  },
  {
    label: 'Spoiler count',
    getValue: (c) => String(c.requiredBooks.length),
  },
  {
    label: 'Has portrait',
    getValue: (c) => (c.image ? 'Yes' : 'No'),
  },
  {
    label: 'Pronunciation',
    getValue: (c) => c.pronunciation || '—',
  },
]

function CharacterSelector({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#8a6840]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer border border-[#5a3e1e] bg-[#2a180c] px-3 py-2 font-[var(--font-display)] text-[13px] text-[#d8b878] focus:outline-none focus:[box-shadow:var(--focus-ring)]"
        style={{
          background: 'linear-gradient(180deg, #3a2a14 0%, #24180a 100%)',
        }}
      >
        <option value="">Choose a name…</option>
        {ALL_CHARACTERS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [charA, setCharA] = useState(searchParams.get('a') ?? '')
  const [charB, setCharB] = useState(searchParams.get('b') ?? '')

  useSEOMeta({
    title: 'Character Comparison — Cosmere Archive',
    description: 'Compare two Cosmere characters side by side',
  })

  const characterA = useMemo(() => ALL_CHARACTERS.find((c) => c.id === charA), [charA])
  const characterB = useMemo(() => ALL_CHARACTERS.find((c) => c.id === charB), [charB])

  const updateA = (id: string) => {
    setCharA(id)
    setSearchParams({ a: id, b: charB }, { replace: true })
  }

  const updateB = (id: string) => {
    setCharB(id)
    setSearchParams({ a: charA, b: id }, { replace: true })
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[var(--surface-void)]">
      <div
        className="relative z-20 flex shrink-0 flex-col items-center gap-2 px-5 pt-5 pb-3"
        style={{
          background: 'linear-gradient(180deg, rgb(8 10 14 / .9) 0%, rgb(8 10 14 / 0) 100%)',
        }}
      >
        <div
          className="relative px-6 py-2"
          style={{
            background: 'linear-gradient(180deg, #3a2a14 0%, #24180a 100%)',
            border: '1px solid #5a3e1e',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(190,150,100,0.12)',
          }}
        >
          <h1 className="font-[var(--font-display)] text-[var(--text-h3)] tracking-[0.04em] text-[#d8b878]">
            The Balance
          </h1>
        </div>
        <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#8a6840]">
          Compare two records
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--gutter-md)] py-2xl max-md:px-[var(--gutter)]">
        <div className="mx-auto max-w-page">
          <BackToMapButton to="/characters" label="Back to characters" className="mb-6" />

          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <CharacterSelector label="First record" value={charA} onChange={updateA} />
            <CharacterSelector label="Second record" value={charB} onChange={updateB} />
          </div>

          {characterA && characterB ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <RecordCard character={characterA} attrs={ATTRS} />
              <RecordCard character={characterB} attrs={ATTRS} />
            </div>
          ) : (
            <p className="mt-12 text-center font-[var(--font-display)] text-[14px] italic text-[#8a6840]">
              Choose two names to set them side by side.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function RecordCard({ character, attrs }: { character: (typeof ALL_CHARACTERS)[number]; attrs: typeof ATTRS }) {
  return (
    <div
      className="overflow-hidden p-5"
      style={{
        background: 'linear-gradient(152deg, #f2e9d4 0%, #eae0c8 40%, #e0d4b6 76%, #d6c8a6 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transform: 'rotate(-0.3deg)',
      }}
    >
      <div className="flex items-center gap-3">
        {character.image ? (
          <img
            src={`${import.meta.env.BASE_URL}${character.image}`}
            alt=""
            className="h-12 w-12 shrink-0 object-cover"
            style={{ border: '1px solid rgba(60,40,20,0.3)' }}
          />
        ) : (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center font-[var(--font-display)] text-[18px] text-[#5a4028]"
            style={{ background: 'rgba(60,40,20,0.12)', border: '1px solid rgba(60,40,20,0.3)' }}
          >
            {character.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-[var(--font-display)] text-[18px] leading-[1.15] text-[#241a12]">{character.name}</div>
          <div className="font-[var(--font-mono)] text-[10px] text-[#8a6840]">{character.id}</div>
        </div>
      </div>
      <p className="mt-3 font-[var(--font-display)] text-[12px] italic leading-[1.5] text-[#5a4028]">
        {character.description}
      </p>
      <div aria-hidden className="my-3 h-px w-full bg-[rgba(60,40,20,0.35)]" />
      <dl className="space-y-2">
        {attrs.map((attr) => (
          <div key={attr.label} className="flex justify-between gap-2">
            <dt className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.15em] text-[#8a6840]">
              {attr.label}
            </dt>
            <dd className="text-right font-[var(--font-display)] text-[12px] text-[#241a12]">
              {attr.getValue(character)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
