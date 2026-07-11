import { useMemo, type ReactElement, type ReactNode } from 'react'
import type { Character } from '@/types/character'
import type { FamilyDefinition } from '@/types/family'
import { computeGenealogyLayout } from '@/utils/genealogy-layout'
import { getCharacterPortrait } from '@/utils/character-portrait'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const
const LEFT_W = 300
const GUTTER = 28
const RIGHT_MIN_W = 620
const HEADING_H = 90
const PAD = 24
const NODE_R = 34
const COL2 = LEFT_W + GUTTER

const pt = { x: 0, y: 0 }

function ClickGroup({
  onClick,
  children,
  ...rest
}: {
  onClick: () => void
  children: ReactNode
} & Record<string, unknown>) {
  return (
    <g
      onMouseDown={(e) => {
        pt.x = e.clientX
        pt.y = e.clientY
      }}
      onMouseUp={(e) => {
        if (Math.abs(e.clientX - pt.x) < 4 && Math.abs(e.clientY - pt.y) < 4) onClick()
      }}
      style={{ cursor: 'pointer' } as React.CSSProperties}
      {...rest}
    >
      {children}
    </g>
  )
}

function firstName(name: string): string {
  return name.split(' ')[0]!
}

interface Props {
  family: FamilyDefinition
  families: FamilyDefinition[]
  characters: Map<string, Character>
  charTitles: Map<string, string[]>
  selectedId: string | null
  onCharacterClick: (id: string) => void
  onFamilyClick: (id: string) => void
}

export default function GenealogySvgContent({
  family,
  families,
  characters,
  charTitles,
  selectedId,
  onCharacterClick,
  onFamilyClick,
}: Props) {
  const layout = useMemo(() => computeGenealogyLayout(family, characters, charTitles), [family, characters, charTitles])

  const rightW = Math.max(RIGHT_MIN_W, layout.svgW + 60)
  const docW = LEFT_W + GUTTER + rightW + PAD
  const treeH = Math.max(300, layout.svgH + 40) + HEADING_H
  const docH = treeH + PAD * 2
  const treeOffX = COL2 + (rightW - layout.svgW) / 2
  const treeOffY = HEADING_H + 12
  const selIdx = families.findIndex((f) => f.id === family.id)

  const transformPath = (d: string) =>
    d
      .split(/(?=[MC])/)
      .map((seg) => {
        const cmd = seg[0]!
        const nums = seg
          .slice(1)
          .trim()
          .split(/[\s,]+/)
          .map(Number)
        if (cmd === 'M' && nums.length >= 2) return `M${treeOffX + nums[0]!},${treeOffY + nums[1]!}`
        if (cmd === 'C' && nums.length >= 6)
          return `C${treeOffX + nums[0]!},${treeOffY + nums[1]!} ${treeOffX + nums[2]!},${treeOffY + nums[3]!} ${treeOffX + nums[4]!},${treeOffY + nums[5]!}`
        if (cmd === 'L' && nums.length >= 2) return `L${treeOffX + nums[0]!},${treeOffY + nums[1]!}`
        return seg
      })
      .join(' ')

  const renderNode = (id: string, pos: { x: number; y: number }) => {
    const member = family.members.find((m) => m.id === id)!
    const charData = member.characterId ? characters.get(member.characterId) : undefined
    const name = charData?.name ?? member.name
    const shortName = firstName(name)
    const titles = member.characterId ? charTitles.get(member.characterId) : undefined
    const title = titles?.[0] ?? ''
    const isDeceased = member.isDeceased
    const isSelected = selectedId === member.characterId
    const nx = treeOffX + pos.x
    const ny = treeOffY + pos.y
    const imgUrl = member.characterId ? getCharacterPortrait(name) : ''
    const clipId = member.characterId ? `genea-c-${member.characterId}-${id}` : ''
    const clickTarget = member.characterId ?? id

    const els: ReactElement[] = []

    if (isDeceased) {
      els.push(
        <text
          key="x"
          x={nx}
          y={ny - NODE_R - 2}
          textAnchor="middle"
          fontSize={14}
          fontFamily="Georgia,serif"
          fill="#8a7050"
          opacity={0.55}
        >
          †
        </text>,
      )
    }

    els.push(
      <circle
        key="ring"
        cx={nx}
        cy={ny}
        r={NODE_R}
        fill="#f5efe6"
        stroke="#c4a86a"
        strokeWidth={2}
        opacity={isDeceased ? 0.55 : 1}
      />,
    )

    if (clipId) {
      els.push(
        <clipPath key={`cp-${clipId}`} id={clipId}>
          <circle cx={nx} cy={ny} r={NODE_R - 1.5} />
        </clipPath>,
      )
    }

    els.push(
      <text
        key="init"
        x={nx}
        y={ny + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={NODE_R * 0.5}
        fontFamily="Georgia,serif"
        fontWeight="bold"
        fill="#8a7050"
        opacity={isDeceased ? 0.4 : 0.65}
      >
        {name.charAt(0).toUpperCase()}
      </text>,
    )

    if (imgUrl && clipId) {
      els.push(
        <image
          key="img"
          href={imgUrl}
          x={nx - NODE_R + 1.5}
          y={ny - NODE_R + 1.5}
          width={(NODE_R - 1.5) * 2}
          height={(NODE_R - 1.5) * 2}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
          opacity={isDeceased ? 0.5 : 1}
          onError={(e) => {
            ;(e.currentTarget as SVGImageElement).style.display = 'none'
          }}
        />,
      )
    }

    els.push(
      <text
        key="lb"
        x={nx}
        y={ny + NODE_R + 6}
        textAnchor="middle"
        fontSize={14}
        fontFamily="Georgia,serif"
        fontWeight="bold"
        fill={isDeceased ? '#8a7a6a' : '#1a0e06'}
        opacity={isDeceased ? 0.55 : 1}
      >
        {shortName.toUpperCase()}
      </text>,
    )

    if (title) {
      els.push(
        <text
          key="ti"
          x={nx}
          y={ny + NODE_R + 24}
          textAnchor="middle"
          fontSize={13}
          fontFamily="Georgia,serif"
          fontStyle="italic"
          fill="#7a6a5a"
        >
          {title.length > 22 ? title.slice(0, 20) + '…' : title}
        </text>,
      )
    }

    if (isSelected) {
      els.push(
        <circle
          key="sel"
          cx={nx}
          cy={ny}
          r={NODE_R + 3}
          fill="none"
          stroke="#c4a86a"
          strokeWidth={1.5}
          opacity={0.5}
        />,
      )
    }

    els.push(
      <circle key="glow" cx={nx} cy={ny} r={NODE_R + 2} fill="none" stroke="#c4a86a" strokeWidth={0} opacity={0}>
        <animate attributeName="stroke-width" values="0;2;0" dur="0.3s" fill="freeze" begin="mouseenter" />
        <animate attributeName="opacity" values="0;0.6;0" dur="0.3s" fill="freeze" begin="mouseenter" />
      </circle>,
    )

    return (
      <ClickGroup key={`node-${id}`} onClick={() => onCharacterClick(clickTarget)}>
        {els}
      </ClickGroup>
    )
  }

  return (
    <g>
      <rect x={0} y={0} width={docW} height={docH} fill="#f5efe6" />

      {/* ═══════════════ LEFT: ARCHIVE INDEX ═══════════════ */}
      <text
        x={LEFT_W / 2}
        y={24}
        textAnchor="middle"
        fontSize={22}
        fontFamily="Georgia,serif"
        fill="#1a0e06"
        fontWeight="bold"
      >
        ARCHIVES OF BLOODLINES
      </text>
      <line x1={PAD} y1={40} x2={LEFT_W - PAD} y2={40} stroke="#c4a86a" strokeWidth={0.5} opacity={0.18} />

      {families.map((f, i) => {
        const isActive = f.id === family.id
        const ey = 58 + i * 62
        const numeral = ROMAN[i] ?? `${i + 1}`

        return (
          <ClickGroup key={`fi-${f.id}`} onClick={() => onFamilyClick(f.id)}>
            {isActive && (
              <path
                d={`M${PAD - 7},${ey + 2} Q${PAD - 1},${ey - 3} ${PAD},${ey + 13}`}
                stroke="#c4a86a"
                strokeWidth={1.5}
                fill="none"
                opacity={0.22}
              />
            )}
            <text
              x={PAD + 10}
              y={ey + 16}
              fontSize={16}
              fontFamily="Georgia,serif"
              fill={isActive ? '#c4a86a' : '#a09080'}
            >
              {numeral}.
            </text>
            <text
              x={PAD + 46}
              y={ey + 5}
              fontSize={17}
              fontFamily="Georgia,serif"
              fontWeight="bold"
              fill={isActive ? '#1a0e06' : '#5a4a3a'}
            >
              {f.name.toUpperCase()}
            </text>
            <text
              x={PAD + 46}
              y={ey + 26}
              fontSize={14}
              fontFamily="Georgia,serif"
              fill={isActive ? '#6b5a4a' : '#8a7a6a'}
            >
              {f.description.length > 30 ? f.description.slice(0, 28) + '…' : f.description}
            </text>
            <text x={PAD + 46} y={ey + 44} fontSize={12} fontFamily="Georgia,serif" fill="#a09080">
              {f.members.length} recorded
            </text>
            {isActive && i < families.length - 1 && (
              <>
                <line
                  x1={PAD + 46}
                  y1={ey + 56}
                  x2={LEFT_W - PAD}
                  y2={ey + 56}
                  stroke="#c4a86a"
                  strokeWidth={0.5}
                  opacity={0.1}
                />
                <circle cx={PAD + 38} cy={ey + 56} r={2} fill="#c4a86a" opacity={0.15} />
              </>
            )}
          </ClickGroup>
        )
      })}

      <text x={LEFT_W / 2} y={docH - PAD} textAnchor="middle" fontSize={13} fontFamily="Georgia,serif" fill="#8a7a6a">
        — {selIdx + 1} —
      </text>

      {/* ═══════════════ RIGHT: FAMILY HEADING ═══════════════ */}
      <text
        x={COL2 + rightW / 2}
        y={26}
        textAnchor="middle"
        fontSize={36}
        fontFamily="Georgia,serif"
        fill="#1a0e06"
        fontWeight="bold"
      >
        {family.name.toUpperCase()}
      </text>
      <text
        x={COL2 + rightW / 2}
        y={56}
        textAnchor="middle"
        fontSize={18}
        fontFamily="Georgia,serif"
        fontStyle="italic"
        fill="#6b5a4a"
      >
        {family.description}
      </text>
      <line
        x1={COL2 + rightW / 2 - 54}
        y1={74}
        x2={COL2 + rightW / 2 + 54}
        y2={74}
        stroke="#c4a86a"
        strokeWidth={0.5}
        opacity={0.15}
      />
      <circle cx={COL2 + rightW / 2 - 6} cy={74} r={3} fill="#c4a86a" opacity={0.2} />
      <circle cx={COL2 + rightW / 2 + 6} cy={74} r={3} fill="#c4a86a" opacity={0.2} />

      {/* ═══════════════ TREE ═══════════════ */}

      {layout.connections.map((conn, i) => (
        <path
          key={`c-${i}`}
          d={transformPath(conn.path)}
          fill="none"
          stroke={conn.isSpouse ? '#8a7a6a' : '#2d1a0e'}
          strokeWidth={conn.isSpouse ? 1.2 : 2}
          opacity={conn.isSpouse ? 0.3 : 0.5}
        />
      ))}

      {[...layout.positions].map(([id, pos]) => renderNode(id, pos))}
    </g>
  )
}
