import { useJourneyCtx, useJourneyDerived } from './JourneyContext'

const SPEED_PRESETS = [0.5, 1, 2, 5] as const

interface Props {
  onClose?: () => void
}

export default function JourneyControls({ onClose }: Props) {
  const ctx = useJourneyCtx()
  const { pct, yearStr, fromName, toName, segmentDesc, timeStr } = useJourneyDerived(ctx)

  const whData = ctx.whData

  if (ctx.unknown || !whData) {
    return (
      <div
        data-testid="journey-controls"
        className="absolute bottom-20 left-1/2 z-30 w-[90vw] max-w-md -translate-x-1/2 rounded-xl border border-gray-700/60 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-lg sm:bottom-24 sm:p-5"
      >
        <p className="text-center text-sm text-gray-500">Unknown worldhopper</p>
      </div>
    )
  }

  return (
    <div
      data-testid="journey-controls"
      className="absolute bottom-20 left-1/2 z-30 w-[90vw] max-w-md -translate-x-1/2 rounded-xl border border-gray-700/60 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-lg sm:bottom-24 sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: whData.color }} />
          <span className="text-base font-bold text-gray-100">{whData.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={ctx.handleReset}
            aria-label="Reset journey"
            className="rounded px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            aria-label="Close journey"
            className="rounded px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
          >
            Close
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={ctx.handleSkipPrev}
          disabled={ctx.currentStop <= 0}
          aria-label="Skip to previous stop"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M8 1L3 5l5 4V1zM2 1v8H1V1h1z" />
          </svg>
        </button>

        <button
          onClick={ctx.handlePlayPause}
          aria-label={ctx.playing || ctx.autoPaused ? 'Pause' : 'Play'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white transition-colors hover:bg-purple-500"
        >
          {ctx.playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="1" width="3.5" height="12" rx="0.5" />
              <rect x="8.5" y="1" width="3.5" height="12" rx="0.5" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 1l10 6-10 6V1z" />
            </svg>
          )}
        </button>

        <button
          onClick={ctx.handleSkipNext}
          disabled={ctx.currentStop >= ctx.segments.length - 1}
          aria-label="Skip to next stop"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 1l5 4-5 4V1zM8 1v8H7V1h1z" />
          </svg>
        </button>

        <div className="flex-1">
          <div className="relative h-2 overflow-hidden rounded-full bg-gray-800">
            {ctx.stopProgresses.map((range, i) => (
              <div
                key={i}
                className="absolute top-0 h-full w-0.5 bg-gray-600"
                style={{ left: `${range.start * 100}%`, transform: 'translateX(-50%)' }}
              />
            ))}
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${pct}%`, backgroundColor: whData.color }}
            />
          </div>
        </div>
        <span data-testid="journey-progress" className="w-10 text-right text-xs text-gray-400">
          {pct}%
        </span>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span data-testid="journey-info" className="font-medium text-gray-200">
            {ctx.pos.fromPlanet !== ctx.pos.toPlanet ? `${fromName} → ${toName}` : fromName}
          </span>
          <span data-testid="journey-year" className="text-gray-500">
            {yearStr}
          </span>
        </div>
        <span className="text-gray-600">{timeStr}</span>
      </div>

      {segmentDesc && (
        <p data-testid="journey-description" className="mb-3 text-xs leading-relaxed text-gray-400">
          {segmentDesc}
        </p>
      )}

      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {SPEED_PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => ctx.handleSpeedPreset(s)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                ctx.currentSpeed === s
                  ? 'bg-purple-900/40 text-purple-300'
                  : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={ctx.currentSpeed}
          onChange={ctx.handleSpeedChange}
          aria-label="Speed"
          className="slider h-1 flex-1 cursor-pointer appearance-none rounded-full bg-gray-800 accent-purple-500"
        />
        <span className="w-6 text-right text-xs text-gray-400">{ctx.currentSpeed}x</span>
      </div>
    </div>
  )
}
