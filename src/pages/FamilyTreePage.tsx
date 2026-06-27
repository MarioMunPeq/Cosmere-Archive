import { useState, useMemo } from 'react'
import { FAMILY_TREES } from '@/data/static/family-data'
import { ALL_CHARACTERS } from '@/data/static'
import FamilyTreeView from '@/components/detail/FamilyTreeView'
import PageLayout from '@/components/ui/PageLayout'
import { useSEOMeta } from '@/hooks/useSEOMeta'

function crossTreeFamilies(characterId: string): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = []
  for (const f of FAMILY_TREES) {
    if (f.members.some((m) => m.characterId === characterId)) {
      result.push({ id: f.id, name: f.name })
    }
  }
  return result
}

export default function FamilyTreePage() {
  useSEOMeta({
    title: 'Family Trees — Cosmere Archive',
    description: 'Family trees and dynastic connections of major Cosmere characters',
  })

  const [selectedFamily, setSelectedFamily] = useState(FAMILY_TREES[0]!.id)
  const [detailId, setDetailId] = useState<string | undefined>(undefined)

  const family = FAMILY_TREES.find((f) => f.id === selectedFamily) ?? FAMILY_TREES[0]!
  const detailChar = detailId ? (ALL_CHARACTERS.find((c) => c.id === detailId) ?? null) : null

  const detailMember = detailId ? (family.members.find((m) => m.characterId === detailId) ?? null) : null

  const crossTrees = useMemo(() => (detailId ? crossTreeFamilies(detailId) : []), [detailId])

  return (
    <PageLayout>
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
            <p className="mt-2 text-xxs text-gray-600">
              Planet: <span className="capitalize text-gray-500">{detailChar.planet.replace(/_/g, ' ')}</span>
            </p>
            {detailMember.isDeceased && (
              <span className="mt-2 inline-block rounded bg-red-900/20 px-2 py-0.5 text-xxs text-red-400">
                Deceased
              </span>
            )}
            <p className="mt-1 text-xxs text-gray-600">
              {(() => {
                const label = detailMember.parentIds
                  ? detailMember.gender === 'female'
                    ? 'Daughter of'
                    : 'Son of'
                  : detailMember.spouseId
                    ? 'Spouse of'
                    : null
                if (!label) return null
                const names = detailMember.parentIds
                  ? detailMember.parentIds
                      .map((pid) => {
                        const p = family.members.find((m) => m.id === pid)
                        return p?.name ?? pid
                      })
                      .join(' & ')
                  : detailMember.spouseId
                    ? (() => {
                        const sp = family.members.find((m) => m.id === detailMember.spouseId)
                        return sp?.name ?? detailMember.spouseId
                      })()
                    : null
                if (!names) return null
                return (
                  <>
                    {label} <span className="text-gray-500">{names}</span>
                  </>
                )
              })()}
            </p>
            {crossTrees.length > 1 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {crossTrees
                  .filter((t) => t.id !== selectedFamily)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedFamily(t.id)
                        setDetailId(detailId)
                      }}
                      className="rounded bg-purple-900/30 px-2 py-0.5 text-xxs text-purple-400 transition-colors hover:bg-purple-900/50"
                    >
                      Also in {t.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
