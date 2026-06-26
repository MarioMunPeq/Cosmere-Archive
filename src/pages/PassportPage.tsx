import { useMemo } from 'react'
import { PLANETS, BOOKS, ALL_CHARACTERS } from '@/data/static'
import { usePassport } from '@/hooks/usePassport'

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
      <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function PassportPage() {
  const passport = usePassport()

  const totalPlanets = PLANETS.length
  const totalBooks = BOOKS.length
  const totalCharacters = ALL_CHARACTERS.length

  const allPlanets = useMemo(() => PLANETS, [])
  const allBooks = useMemo(() => BOOKS, [])
  const allCharacters = useMemo(() => ALL_CHARACTERS, [])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-100">Cosmere Passport</h1>
        <p className="mt-1 text-sm text-gray-500">Track your journey through the Cosmere</p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {passport.completedPlanets}/{totalPlanets}
          </p>
          <p className="text-xs text-gray-500">Planets</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {passport.completedBooks}/{totalBooks}
          </p>
          <p className="text-xs text-gray-500">Books</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {passport.completedCharacters}/{totalCharacters}
          </p>
          <p className="text-xs text-gray-500">Characters</p>
        </div>
      </div>

      <div className="mb-2">
        <ProgressBar
          value={passport.completedPlanets + passport.completedBooks + passport.completedCharacters}
          max={totalPlanets + totalBooks + totalCharacters}
        />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Planets</h2>
        <div className="space-y-1">
          {allPlanets.map((planet) => {
            const visited = passport.isPlanetVisited(planet.id)
            return (
              <button
                key={planet.id}
                onClick={() => passport.togglePlanet(planet.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  visited
                    ? 'border-purple-900/50 bg-purple-900/20 text-purple-300'
                    : 'border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'
                }`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: planet.color }} />
                <span className="flex-1">{planet.name}</span>
                <span className="text-xs">{visited ? '✓' : ''}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Books</h2>
        <div className="space-y-1">
          {allBooks.map((book) => {
            const read = passport.isBookRead(book.id)
            return (
              <button
                key={book.id}
                onClick={() => passport.toggleBook(book.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  read
                    ? 'border-purple-900/50 bg-purple-900/20 text-purple-300'
                    : 'border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'
                }`}
              >
                <span className="flex-1">{book.title}</span>
                <span className="text-xs">{read ? '✓' : ''}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Characters</h2>
        <div className="space-y-1">
          {allCharacters.map((char) => {
            const met = passport.isCharacterMet(char.id)
            return (
              <button
                key={char.id}
                onClick={() => passport.toggleCharacter(char.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  met
                    ? 'border-purple-900/50 bg-purple-900/20 text-purple-300'
                    : 'border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'
                }`}
              >
                <span className="flex-1">{char.name}</span>
                <span className="text-xs">{met ? '✓' : ''}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
