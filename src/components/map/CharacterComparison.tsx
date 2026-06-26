import { useMemo } from 'react'
import { PLANETS, getBookById, SAGA_BY_ID, ALL_CHARACTERS } from '@/data/static'
import type { Character } from '@/types'
import { CloseIcon } from '@/components/common/icons'
import ColorDot from '@/components/ui/ColorDot'

const PLANET_BY_ID = new Map(PLANETS.map((p) => [p.id, p]))

function getCharacterSagas(c: Character): string[] {
  const sagaIds = new Set<string>()
  for (const bookId of c.requiredBooks) {
    const book = getBookById(bookId)
    if (book) sagaIds.add(book.saga)
  }
  return Array.from(sagaIds)
}

function getCharacterBooks(c: Character): string[] {
  return c.requiredBooks.map((id) => {
    const book = getBookById(id)
    return book?.title ?? id
  })
}

interface Props {
  characterIds: [string, string]
  onClose: () => void
}

export default function CharacterComparison({ characterIds, onClose }: Props) {
  const chars = useMemo(() => {
    return characterIds
      .map((id) => ALL_CHARACTERS.find((c) => c.id === id))
      .filter((c): c is Character => c !== undefined)
  }, [characterIds])

  if (chars.length !== 2) return null

  const [a, b] = chars as [Character, Character]
  const aSagas = getCharacterSagas(a)
  const bSagas = getCharacterSagas(b)
  const aBooks = getCharacterBooks(a)
  const bBooks = getCharacterBooks(b)
  const aPlanet = PLANET_BY_ID.get(a.planet)
  const bPlanet = PLANET_BY_ID.get(b.planet)
  const commonSagas = aSagas.filter((s) => bSagas.includes(s))
  const commonPlanet = a.planet === b.planet
  const allSagas = Array.from(new Set([...aSagas, ...bSagas]))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-200">Character Comparison</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-6 grid grid-cols-2 gap-6">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                  <span className="text-sm font-bold text-gray-600">{a.name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-200">{a.name}</h4>
                  {aPlanet && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <ColorDot color={aPlanet.color} size="xs" />
                      {aPlanet.name}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-gray-500">{a.description}</p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                  <span className="text-sm font-bold text-gray-600">{b.name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-200">{b.name}</h4>
                  {bPlanet && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <ColorDot color={bPlanet.color} size="xs" />
                      {bPlanet.name}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-gray-500">{b.description}</p>
            </div>
          </div>

          {commonSagas.length > 0 && (
            <div className="mb-4 rounded-lg border border-purple-900/40 bg-purple-900/10 px-4 py-3">
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">Shared Sagas</h4>
              <div className="flex flex-wrap gap-1.5">
                {commonSagas.map((sId) => {
                  const saga = SAGA_BY_ID.get(sId)
                  return saga ? (
                    <span key={sId} className="rounded-full bg-purple-900/30 px-2 py-0.5 text-xs text-purple-300">
                      {saga.name}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-2 pr-4 font-semibold text-gray-500">Attribute</th>
                <th className="py-2 pr-4 font-semibold text-gray-300">{a.name}</th>
                <th className="py-2 font-semibold text-gray-300">{b.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              <tr className={commonPlanet ? 'bg-purple-900/5' : ''}>
                <td className="py-2 pr-4 text-gray-500">Planet</td>
                <td className={`py-2 pr-4 ${commonPlanet ? 'text-purple-300' : 'text-gray-400'}`}>
                  {aPlanet?.name ?? a.planet}
                </td>
                <td className={`py-2 ${commonPlanet ? 'text-purple-300' : 'text-gray-400'}`}>
                  {bPlanet?.name ?? b.planet}
                </td>
              </tr>

              {allSagas.map((sId) => {
                const sInA = aSagas.includes(sId)
                const sInB = bSagas.includes(sId)
                const saga = SAGA_BY_ID.get(sId)
                const shared = sInA && sInB
                return (
                  <tr key={sId} className={shared ? 'bg-purple-900/5' : ''}>
                    <td className="py-2 pr-4 text-gray-500">{saga?.name ?? sId}</td>
                    <td
                      className={`py-2 pr-4 ${sInA ? (shared ? 'text-purple-300' : 'text-gray-400') : 'text-gray-700'}`}
                    >
                      {sInA ? '✓' : '—'}
                    </td>
                    <td className={`py-2 ${sInB ? (shared ? 'text-purple-300' : 'text-gray-400') : 'text-gray-700'}`}>
                      {sInB ? '✓' : '—'}
                    </td>
                  </tr>
                )
              })}

              <tr>
                <td className="py-2 pr-4 text-gray-500">Books</td>
                <td className="py-2 pr-4">
                  <div className="max-w-[200px] space-y-0.5">
                    {aBooks.map((title) => (
                      <div key={title} className="text-gray-400">
                        {title}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="py-2">
                  <div className="max-w-[200px] space-y-0.5">
                    {bBooks.map((title) => (
                      <div key={title} className="text-gray-400">
                        {title}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
