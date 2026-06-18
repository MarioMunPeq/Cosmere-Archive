import { SAGAS } from '@/data/static'

interface TimelineFiltersProps {
  selectedType: string
  onTypeChange: (type: string) => void
  selectedSaga: string
  onSagaChange: (saga: string) => void
  yearRange: [number, number]
  onYearRangeChange: (range: [number, number]) => void
  minYear: number
  maxYear: number
}

export default function TimelineFilters({
  selectedType,
  onTypeChange,
  selectedSaga,
  onSagaChange,
}: TimelineFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Tipo</label>
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-gray-300 focus:border-purple-500 focus:outline-none"
        >
          <option value="all">Todos</option>
          <option value="book">Libros</option>
          <option value="historical">Históricos</option>
          <option value="cataclysm">Cataclismos</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Saga</label>
        <select
          value={selectedSaga}
          onChange={(e) => onSagaChange(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-gray-300 focus:border-purple-500 focus:outline-none"
        >
          <option value="all">Todas</option>
          {SAGAS.map((saga) => (
            <option key={saga.id} value={saga.id}>{saga.name}</option>
          ))}
          <option value="pre-cosmere">Pre-Cosmere</option>
        </select>
      </div>
    </div>
  )
}
