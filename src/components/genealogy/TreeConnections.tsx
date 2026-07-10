import { useMemo } from 'react'

interface Connection {
  path: string
}

interface Props {
  connections: Connection[]
  visible: boolean
}

export default function TreeConnections({ connections, visible }: Props) {
  const totalLen = useMemo(() => connections.length * 500 + 300, [connections.length])

  if (!visible || connections.length === 0) return null

  return (
    <g>
      {connections.map((c, i) => {
        const isSpouse = !c.path.includes('C')
        const delay = 400 + i * 50

        return (
          <g key={i}>
            {/* Ink bleed — faint, wide */}
            <path
              d={c.path}
              fill="none"
              stroke="#1a0e06"
              strokeWidth={isSpouse ? 2.5 : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.03}
              strokeDasharray={totalLen}
              strokeDashoffset={totalLen}
              style={{
                animation: visible ? `genea-draw 600ms ease-out ${delay}ms forwards` : undefined,
              }}
            />
            {/* Main ink stroke */}
            <path
              d={c.path}
              fill="none"
              stroke="#2a1a0e"
              strokeWidth={isSpouse ? 0.9 : 1.3}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.25}
              strokeDasharray={totalLen}
              strokeDashoffset={totalLen}
              style={{
                animation: visible ? `genea-draw 700ms ease-out ${delay + 20}ms forwards` : undefined,
              }}
            />
            {/* Fine quill hairline */}
            <path
              d={c.path}
              fill="none"
              stroke="#4a3a2a"
              strokeWidth={isSpouse ? 0.3 : 0.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.15}
              strokeDasharray={totalLen}
              strokeDashoffset={totalLen}
              style={{
                animation: visible ? `genea-draw 800ms ease-out ${delay + 40}ms forwards` : undefined,
              }}
            />
          </g>
        )
      })}
    </g>
  )
}
