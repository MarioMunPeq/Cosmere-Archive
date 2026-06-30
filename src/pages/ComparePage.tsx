import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import BackToMapButton from '@/components/ui/BackToMapButton'
import CompareCharacterPanel from '@/components/ui/CompareCharacterPanel'
import { ALL_CHARACTERS, PLANETS, BOOKS, SAGA_BY_ID } from '@/data/static'
import PageLayout from '@/components/ui/PageLayout'
import { useSEOMeta } from '@/hooks/useSEOMeta'

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
    <div>
      <label className="mb-1 block text-xs text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none"
      >
        <option value="">Select a character…</option>
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

  const planetA = characterA ? PLANETS.find((p) => p.id === characterA.planet) : null
  const planetB = characterB ? PLANETS.find((p) => p.id === characterB.planet) : null

  return (
    <PageLayout variant="center">
      <div className="w-full max-w-4xl animate-fade-in-up">
        <BackToMapButton to="/characters" label="Back to characters" className="mb-6" />

        <h1 className="text-3xl font-bold text-gray-100">Character Comparison</h1>
        <p className="mt-1 text-sm text-gray-500">Compare two characters side by side</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <CharacterSelector label="Character A" value={charA} onChange={updateA} />
          <CharacterSelector label="Character B" value={charB} onChange={updateB} />
        </div>

        {characterA && characterB ? (
          <div className="mt-8 grid gap-0 overflow-hidden rounded-lg border border-gray-800 sm:grid-cols-2">
            <CompareCharacterPanel
              character={characterA}
              planet={planetA}
              attrs={ATTRS}
              className="border-b border-gray-800 sm:border-b-0 sm:border-r"
            />
            <CompareCharacterPanel character={characterB} planet={planetB} attrs={ATTRS} />
          </div>
        ) : (
          <p className="mt-12 text-center text-sm text-gray-600">Select two characters to compare them side by side</p>
        )}
      </div>
    </PageLayout>
  )
}
