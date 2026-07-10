import { useMemo } from 'react'

interface Connection {
  path: string
}

interface Props {
  connections: Connection[]
  visible: boolean
}

export default function GenealogyConnections({ connections, visible }: Props) {
  const pathLen = useMemo(() => connections.length * 600 + 400, [connections.length])

  if (!visible || connections.length === 0) return null

  return (
    <g>
      {connections.map((c, i) => {
        const isSpouse = !c.path.includes('C')
        return (
          <g key={i}>
            {/* Ink bleed layer — wide, deep */}
            <path
              d={c.path}
              fill="none"
              stroke="#1a0e06"
              strokeWidth={isSpouse ? 3 : 3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.06}
              strokeDasharray={pathLen}
              strokeDashoffset={pathLen}
              style={{
                animation: visible ? `genea-draw 700ms ease-out ${400 + i * 40}ms forwards` : undefined,
              }}
            />
            {/* Main ink stroke */}
            <path
              d={c.path}
              fill="none"
              stroke="#2a1a0e"
              strokeWidth={isSpouse ? 1.2 : 1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={!isSpouse ? 'url(#conn-arrow)' : undefined}
              opacity={0.7}
              strokeDasharray={pathLen}
              strokeDashoffset={pathLen}
              style={{
                animation: visible ? `genea-draw 750ms ease-out ${420 + i * 40}ms forwards` : undefined,
              }}
            />
            {/* Fine ink hairline */}
            <path
              d={c.path}
              fill="none"
              stroke="#4a3a2a"
              strokeWidth={isSpouse ? 0.4 : 0.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.35}
              strokeDasharray={pathLen}
              strokeDashoffset={pathLen}
              style={{
                animation: visible ? `genea-draw 800ms ease-out ${440 + i * 40}ms forwards` : undefined,
              }}
            />
          </g>
        )
      })}
    </g>
  )
}
