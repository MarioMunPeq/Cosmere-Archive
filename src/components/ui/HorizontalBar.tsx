import { memo, type ReactNode } from 'react'

interface BarItem {
  key: string
  label: ReactNode
  count: number
  color: string
}

interface Props {
  title: string
  items: BarItem[]
}

const HorizontalBar = memo(function HorizontalBar({ title, items }: Props) {
  const maxCount = Math.max(...items.map((i) => i.count), 1)

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
      <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => {
          const pct = (item.count / maxCount) * 100
          return (
            <div key={item.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-gray-600">{item.count}</span>
              </div>
              <div className="mt-0.5 h-1.5 rounded-full bg-gray-800">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default HorizontalBar
