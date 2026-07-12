interface ShardInfo {
  name: string
  color: string
  planets: string[]
  magicSystems: string[]
}

interface Props {
  shard: ShardInfo
  onClose: () => void
}

export default function ShardManuscriptPanel({ shard, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(8,6,4,0.75)' }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative w-full max-w-lg animate-fade-in-up overflow-hidden rounded-sm"
        style={{
          animationDuration: '600ms',
          animationFillMode: 'backwards',
          background: `
            linear-gradient(135deg, #e4d8c4 0%, #dcd0bc 40%, #d4c4a8 100%),
            repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(100,80,60,0.02) 24px, rgba(100,80,60,0.02) 25px)
          `,
          boxShadow: '0 20px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(120,100,80,0.12)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-black/5"
          style={{ color: 'rgba(42,26,10,0.3)' }}
          aria-label="Close"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <line x1="2" y1="2" x2="10" y2="10" />
            <line x1="10" y1="2" x2="2" y2="10" />
          </svg>
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="rounded-full shrink-0"
              style={{
                width: 48,
                height: 48,
                background: `radial-gradient(circle at 35% 35%, ${shard.color}cc, ${shard.color}66)`,
                boxShadow: `0 0 20px ${shard.color}30`,
              }}
            />
            <div>
              <div
                className="text-base tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(42,26,10,0.7)' }}
              >
                {shard.name}
              </div>
              <div
                className="text-[10px] italic"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'rgba(80,60,40,0.4)' }}
              >
                {shard.planets.length} world{shard.planets.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div
            className="h-px mb-4"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(42,26,10,0.1), transparent)' }}
          />

          <div className="space-y-4">
            <div>
              <div
                className="text-[8px] uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(42,26,10,0.3)' }}
              >
                Associated Worlds
              </div>
              <div className="flex flex-wrap gap-1.5">
                {shard.planets.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] italic px-2 py-0.5"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: 'rgba(80,60,40,0.45)',
                      border: '1px solid rgba(42,26,10,0.06)',
                      borderRadius: 1,
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {shard.magicSystems.length > 0 && (
              <div>
                <div
                  className="text-[8px] uppercase tracking-widest mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(42,26,10,0.3)' }}
                >
                  Magic Systems ({shard.magicSystems.length})
                </div>
                <div className="space-y-1.5">
                  {shard.magicSystems.map((ms) => (
                    <div
                      key={ms}
                      className="text-[10px] italic px-2 py-1"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: 'rgba(42,26,10,0.5)',
                        border: '1px solid rgba(42,26,10,0.05)',
                        borderRadius: 1,
                      }}
                    >
                      {ms}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Page number */}
          <div
            className="text-center text-[8px] italic mt-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'rgba(80,60,40,0.15)' }}
          >
            — Shardic Record —
          </div>
        </div>
      </div>
    </div>
  )
}
