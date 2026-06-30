import { memo } from 'react'
import ColorDot from '@/components/ui/ColorDot'

interface ShardCardData {
  name: string
  color: string
  description?: string
}

interface Props {
  shard: ShardCardData
  investiture?: { name: string; description: string }[]
  magicSystems?: string[]
  children?: React.ReactNode
}

const ShardCard = memo(function ShardCard({ shard, investiture, magicSystems, children }: Props) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
      <div className="flex items-center gap-3">
        <ColorDot color={shard.color} size="lg" />
        <h2 className="text-lg font-semibold text-gray-100" style={{ color: shard.color }}>
          {shard.name}
        </h2>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        {shard.description && <p className="text-gray-400">{shard.description}</p>}

        {investiture && investiture.length > 0 && (
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
              Investiture Systems ({investiture.length})
            </span>
            <ul className="mt-1 space-y-1">
              {investiture.map((inv) => (
                <li key={inv.name}>
                  <span className="text-gray-300">{inv.name}</span>
                  <p className="text-xs text-gray-500">{inv.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {magicSystems && magicSystems.length > 0 && (
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-600">Magic Systems</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {magicSystems.map((ms) => (
                <span key={ms} className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                  {ms}
                </span>
              ))}
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  )
})

export default ShardCard
