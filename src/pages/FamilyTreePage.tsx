import { useState } from 'react'
import { FAMILY_TREES } from '@/data/static/family-data'
import { ALL_CHARACTERS } from '@/data/static'
import FamilyTreeView from '@/components/detail/FamilyTreeView'

export default function FamilyTreePage() {
  const [selectedFamily, setSelectedFamily] = useState(FAMILY_TREES[0]!.id)
  const [detailId, setDetailId] = useState<string | undefined>(undefined)

  const family = FAMILY_TREES.find((f) => f.id === selectedFamily) ?? FAMILY_TREES[0]!
  const detailChar = detailId ? (ALL_CHARACTERS.find((c) => c.id === detailId) ?? null) : null

  const detailMember = detailId ? (family.members.find((m) => m.characterId === detailId) ?? null) : null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-gray-100 sm:text-xl">Family Trees</h1>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FAMILY_TREES.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setSelectedFamily(f.id)
              setDetailId(undefined)
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              selectedFamily === f.id ? 'text-gray-100' : 'bg-gray-800/50 text-gray-500 hover:text-gray-400'
            }`}
            style={{
              backgroundColor: selectedFamily === f.id ? f.color + '30' : undefined,
              color: selectedFamily === f.id ? f.color : undefined,
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-gray-500">{family.description}</p>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        <div className="flex-1 overflow-auto">
          <FamilyTreeView family={family} onSelectCharacter={setDetailId} />
        </div>

        {detailChar && detailMember && (
          <div className="w-64 shrink-0 rounded-lg border border-gray-700/40 bg-gray-800/60 p-4">
            <button
              onClick={() => setDetailId(undefined)}
              className="float-right text-xs text-gray-600 transition-colors hover:text-gray-400"
              aria-label="Close detail"
            >
              ✕
            </button>
            <h3 className="text-sm font-semibold text-gray-200">{detailMember.name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">{detailChar.description}</p>
            <p className="mt-2 text-[10px] text-gray-600">
              Planet: <span className="capitalize text-gray-500">{detailChar.planet.replace(/_/g, ' ')}</span>
            </p>
            {detailMember.isDeceased && (
              <span className="mt-2 inline-block rounded bg-red-900/20 px-2 py-0.5 text-[10px] text-red-400">
                Deceased
              </span>
            )}
            <p className="mt-1 text-[10px] text-gray-600">
              Relationship:{' '}
              <span className="text-gray-500">
                {detailMember.parentIds ? 'Child' : detailMember.spouseId ? 'Spouse' : 'Root'}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
