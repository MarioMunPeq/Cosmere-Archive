import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import type { Character } from '@/types/character'
import type { FamilyMember, FamilyDefinition } from '@/types/family'
import { getCharacterPortrait } from '@/utils'
import { PortraitMedallion } from './PortraitMedallion'
import { PortraitLabel } from './PortraitLabel'
import { CharacterInfoPanel } from './CharacterInfoPanel'

const PLACEHOLDER_IDS = new Set(['kholin_house', 'survivor_circle', 'sel_crowns', 'lord_harms'])

/* ── Procedural composition patterns ── */

function layoutTriangle(n: number, r: number): Array<{ x: number; y: number }> {
  if (n <= 1) return [{ x: 0, y: 0 }]
  if (n === 2)
    return [
      { x: 0, y: -r * 0.3 },
      { x: 0, y: r * 0.3 },
    ]
  const out: Array<{ x: number; y: number }> = []
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    out.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r })
  }
  return out
}

function layoutPentagon(n: number, r: number): Array<{ x: number; y: number }> {
  if (n <= 5) return layoutTriangle(n, r)
  const out: Array<{ x: number; y: number }> = []
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    out.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r })
  }
  return out
}

function layoutDoubleRing(n: number, r: number): Array<{ x: number; y: number }> {
  if (n <= 5) return layoutPentagon(n, r)
  const inner = Math.min(n - 5, 5)
  const outer = n - inner
  const out: Array<{ x: number; y: number }> = []
  for (let i = 0; i < outer; i++) {
    const angle = (i / outer) * Math.PI * 2 - Math.PI / 2
    out.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r })
  }
  for (let i = 0; i < inner; i++) {
    const angle = (i / inner) * Math.PI * 2 - Math.PI / 2
    out.push({ x: Math.cos(angle) * r * 0.5, y: Math.sin(angle) * r * 0.5 })
  }
  return out
}

function layoutSpiral(n: number, r: number): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = []
  const turns = 2.2
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(n - 1, 1)
    const angle = t * turns * Math.PI * 2 - Math.PI / 2
    const radius = r * (0.25 + t * 0.75)
    out.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius })
  }
  return out
}

function layoutOrganic(n: number, r: number): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = []
  const rings = Math.ceil(Math.sqrt(n))
  let idx = 0
  for (let ring = 0; ring < rings && idx < n; ring++) {
    const ringN = ring === 0 ? 1 : Math.min(ring * 5, n - idx)
    const ringR = ring === 0 ? 0 : (ring / rings) * r
    for (let i = 0; i < ringN && idx < n; i++) {
      if (ring === 0) {
        out.push({ x: 0, y: 0 })
      } else {
        const angle = (i / ringN) * Math.PI * 2 + ring * 0.4
        out.push({ x: Math.cos(angle) * ringR, y: Math.sin(angle) * ringR })
      }
      idx++
    }
  }
  return out
}

function proceduralLayout(n: number, r: number): Array<{ x: number; y: number }> {
  if (n <= 3) return layoutTriangle(n, r)
  if (n <= 5) return layoutPentagon(n, r)
  if (n <= 8) return layoutDoubleRing(n, r)
  if (n <= 12) return layoutSpiral(n, r)
  return layoutOrganic(n, r)
}

/* ── Uniform portrait sizing ── */
const PORTRAIT_BASE = 100
const MIN_SPACING = 25

/* ── Collision avoidance (strong push-apart) ── */
interface Circle {
  cx: number
  cy: number
  r: number
  idx: number
}

function relaxCollisions(circles: Circle[], minPad: number, w: number, h: number): void {
  const margin = 20
  for (let pass = 0; pass < 300; pass++) {
    let moved = false

    /* Push apart overlapping circles */
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const a = circles[i]!,
          b = circles[j]!
        const dx = b.cx - a.cx,
          dy = b.cy - a.cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minD = a.r + b.r + minPad
        if (dist < minD && dist > 0.001) {
          const push = (minD - dist) / 2
          const nx = dx / dist,
            ny = dy / dist
          a.cx -= nx * push
          a.cy -= ny * push
          b.cx += nx * push
          b.cy += ny * push
          moved = true
        }
      }
    }

    /* Pull toward center if too far from center (keeps composition tight) */
    const cx = w / 2,
      cy = h / 2
    for (const c of circles) {
      const dx = c.cx - cx,
        dy = c.cy - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxR = Math.min(w, h) * 0.38
      if (dist > maxR) {
        const pull = (dist - maxR) * 0.06
        c.cx -= (dx / dist) * pull
        c.cy -= (dy / dist) * pull
        moved = true
      }
    }

    /* Hard boundary clamp */
    for (const c of circles) {
      const left = margin + c.r,
        right = w - margin - c.r
      const top = margin + c.r,
        bottom = h - margin - c.r
      if (left > right) {
        const mid = w / 2
        c.cx = mid
      } else {
        c.cx = Math.max(left, Math.min(right, c.cx))
      }
      if (top > bottom) {
        const mid = h / 2
        c.cy = mid
      } else {
        c.cy = Math.max(top, Math.min(bottom, c.cy))
      }
    }

    if (!moved) break
  }
}

/* ── Dust particles ── */
function DustParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: 12 + ((i * 41) % 76),
        y: 8 + ((i * 29) % 80),
        dur: 16 + ((i * 7) % 10),
        delay: (i * 3.1) % 7,
        size: 1.2 + (i % 3) * 0.4,
      })),
    [],
  )
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {particles.map((pt) => (
        <div
          key={pt.id}
          style={{
            position: 'absolute',
            left: `${pt.x}%`,
            top: `${pt.y}%`,
            width: pt.size,
            height: pt.size,
            borderRadius: '50%',
            background: 'rgba(184,150,74,0.04)',
            animation: `portraitDustFloat ${pt.dur}s ease-in-out ${pt.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ── Connecting ornaments ── */
function ConnectionOrnaments({
  selectedPos,
  relatedPositions,
  viewW,
  cy,
}: {
  selectedPos: { x: number; y: number } | null
  relatedPositions: Array<{ x: number; y: number }>
  viewW: number
  cy: number
}) {
  if (!selectedPos) return null
  const cx = viewW / 2
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(184,150,74,0.12)" />
          <stop offset="50%" stopColor="rgba(184,150,74,0.04)" />
          <stop offset="100%" stopColor="rgba(184,150,74,0.12)" />
        </linearGradient>
      </defs>
      {relatedPositions.map((rp, i) => (
        <g key={i}>
          <line
            x1={cx + selectedPos.x}
            y1={cy + selectedPos.y}
            x2={cx + rp.x}
            y2={cy + rp.y}
            stroke="url(#ornGrad)"
            strokeWidth="0.5"
            strokeDasharray="2 5"
            opacity="0.35"
          />
          <circle cx={cx + rp.x} cy={cy + rp.y} r="1.5" fill="rgba(184,150,74,0.08)" />
        </g>
      ))}
    </svg>
  )
}

/* ── Helpers ── */
function getChar(m: FamilyMember, cm: Map<string, Character>) {
  return m.characterId ? (cm.get(m.characterId) ?? null) : null
}

/* ── Main component ── */
interface Props {
  family: FamilyDefinition
  charMap: Map<string, Character>
  selectedMemberId: string | null
  onSelectMember: (memberId: string) => void
}

export function PortraitGallery({ family, charMap, selectedMemberId, onSelectMember }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const infoPanelRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 600, h: 500 })
  const [infoH, setInfoH] = useState(0)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [fading, setFading] = useState(false)

  /* Family transition */
  const prevFamRef = useRef(family.id)
  useEffect(() => {
    if (family.id !== prevFamRef.current) {
      prevFamRef.current = family.id
      setFading(true)
      const t = setTimeout(() => setFading(false), 120)
      return () => clearTimeout(t)
    }
  }, [family.id])

  /* Display members (filter placeholders) */
  const display = useMemo(() => family.members.filter((m) => !PLACEHOLDER_IDS.has(m.id)), [family.members])

  /* ── Selection (must come before useEffect that depends on it) ── */
  const heroMember = useMemo(
    () =>
      display.find(
        (m) =>
          m.id === 'dalinar' ||
          m.id === 'shallan' ||
          m.id === 'elend' ||
          m.id === 'kelsier' ||
          m.id === 'vivenna' ||
          m.id === 'raoden' ||
          m.id === 'wax',
      ) ??
      display[0] ??
      null,
    [display],
  )

  const selectedMember = useMemo(() => {
    if (selectedMemberId) {
      const found = display.find((m) => m.id === selectedMemberId)
      if (found) return found
    }
    return heroMember
  }, [display, selectedMemberId, heroMember])

  /* Resize — container + info panel */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      if (e) setDims({ w: e.contentRect.width, h: e.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const el = infoPanelRef.current
    if (!el) {
      setInfoH(0)
      return
    }
    const ro = new ResizeObserver(([e]) => {
      if (e) setInfoH(e.contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [selectedMember])

  /* Portrait size — uniform base */
  const portraitSize = useMemo(() => {
    const avgDim = (dims.w + dims.h) / 2
    return Math.round(PORTRAIT_BASE * Math.min(avgDim / 520, 1.15))
  }, [dims.w, dims.h])

  /* ── Safe area computation (uses measured infoH) ── */
  const safeArea = useMemo(() => {
    const infoPanelH = Math.max(infoH, 100)
    const safePad = { top: 60, bottom: 80, left: 60, right: 60 }
    const availH = dims.h - safePad.top - safePad.bottom - infoPanelH
    const availW = dims.w - safePad.left - safePad.right
    const centerY = safePad.top + availH * 0.44
    return { safePad, availW: Math.max(availW, 100), availH: Math.max(availH, 100), centerY }
  }, [dims.w, dims.h, infoH])

  /* ── Procedural layout with safe-area containment ── */
  const positions = useMemo(() => {
    const out = new Map<string, { x: number; y: number }>()
    const n = display.length
    if (n === 0) return out

    const cx = dims.w / 2,
      cy = safeArea.centerY
    const portraitR = portraitSize / 2
    const maxRadius = Math.min(safeArea.availW / 2 - portraitR, safeArea.availH / 2 - portraitR)
    const layoutR = Math.max(Math.min(maxRadius, Math.min(safeArea.availW, safeArea.availH) * 0.42), portraitR * 2)
    const rawPositions = proceduralLayout(n, layoutR)

    /* Assign positions — hero first (closest to center), then by index */
    const heroIdx = display.findIndex(
      (m) =>
        m.id === 'dalinar' ||
        m.id === 'shallan' ||
        m.id === 'elend' ||
        m.id === 'kelsier' ||
        m.id === 'vivenna' ||
        m.id === 'raoden' ||
        m.id === 'wax',
    )
    const ordered = display.map((m, i) => ({ member: m, idx: i }))
    if (heroIdx >= 0) {
      const hero = ordered.splice(heroIdx, 1)[0]!
      ordered.unshift(hero)
    }

    /* Sort raw positions by distance from center (closest first for hero) */
    const sortedRaw = [...rawPositions].sort((a, b) => {
      const da = Math.sqrt(a.x * a.x + a.y * a.y)
      const db = Math.sqrt(b.x * b.x + b.y * b.y)
      return da - db
    })

    for (let i = 0; i < ordered.length; i++) {
      const raw = sortedRaw[i] ?? rawPositions[i % rawPositions.length]!
      out.set(ordered[i]!.member.id, { x: cx + raw.x, y: cy + raw.y })
    }

    /* Collision relaxation — all portraits same radius, hard safe-area clamp */
    const circles: Circle[] = display.map((m, i) => {
      const pos = out.get(m.id)!
      return { cx: pos.x, cy: pos.y, r: portraitR + MIN_SPACING / 2, idx: i }
    })
    relaxCollisions(circles, MIN_SPACING, dims.w, dims.h)

    /* Hard safe-area clamp — ensure no portrait crosses the safe padding */
    for (const c of circles) {
      const left = safeArea.safePad.left + portraitR
      const right = dims.w - safeArea.safePad.right - portraitR
      const top = safeArea.safePad.top + portraitR
      const bottom = dims.h - safeArea.safePad.bottom - portraitR
      c.cx = Math.max(left, Math.min(right, c.cx))
      c.cy = Math.max(top, Math.min(bottom, c.cy))
    }

    for (let i = 0; i < display.length; i++) {
      const c = circles[i]!
      out.set(display[i]!.id, { x: c.cx, y: c.cy })
    }

    return out
  }, [display, dims, portraitSize, safeArea])

  /* ── Relations ── */
  const relatedIds = useMemo(() => {
    if (!selectedMember) return new Set<string>()
    const ids = new Set<string>()
    for (const pid of selectedMember.parentIds ?? []) ids.add(pid)
    if (selectedMember.spouseId) ids.add(selectedMember.spouseId)
    for (const m of family.members) {
      if ((m.parentIds ?? []).includes(selectedMember.id)) ids.add(m.id)
      if (selectedMember.spouseId && (m.parentIds ?? []).includes(selectedMember.spouseId)) ids.add(m.id)
    }
    for (const m of family.members) {
      if (m.id === selectedMember.id) continue
      if ((m.parentIds ?? []).some((pid) => (selectedMember.parentIds ?? []).includes(pid))) ids.add(m.id)
    }
    return ids
  }, [selectedMember, family.members])

  const { parents, spouse, children, siblings } = useMemo(() => {
    if (!selectedMember)
      return {
        parents: [] as FamilyMember[],
        spouse: null as FamilyMember | null,
        children: [] as FamilyMember[],
        siblings: [] as FamilyMember[],
      }
    const p = (selectedMember.parentIds ?? [])
      .map((pid) => family.members.find((m) => m.id === pid))
      .filter(Boolean) as FamilyMember[]
    const s = selectedMember.spouseId ? (family.members.find((m) => m.id === selectedMember.spouseId) ?? null) : null
    const c = family.members
      .filter(
        (m) => (m.parentIds ?? []).includes(selectedMember.id) || (m.parentIds ?? []).some((pid) => s && pid === s.id),
      )
      .filter((m) => m.id !== selectedMember.id && (!s || m.id !== s.id))
    const sb = family.members
      .filter(
        (m) =>
          m.id !== selectedMember.id &&
          (m.parentIds ?? []).some((pid) => (selectedMember.parentIds ?? []).includes(pid)),
      )
      .filter((m) => !c.some((cm) => cm.id === m.id))
    return { parents: p, spouse: s, children: c, siblings: sb }
  }, [selectedMember, family.members])

  const books = useMemo(
    () => (selectedMember?.characterId ? (charMap.get(selectedMember.characterId)?.requiredBooks ?? []) : []),
    [selectedMember, charMap],
  )
  const selChar = useMemo(
    () => (selectedMember?.characterId ? (charMap.get(selectedMember.characterId) ?? null) : null),
    [selectedMember, charMap],
  )

  const handleSelect = useCallback((id: string) => onSelectMember(id), [onSelectMember])

  /* Empty state */
  if (display.length === 0) {
    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
        }}
      >
        <div style={{ color: '#b8964a', fontSize: 22, marginBottom: 5, opacity: 0.25 }}>❧</div>
        <div style={{ fontSize: 'clamp(10px, 0.85vw, 12px)', color: '#8a7a5a', fontStyle: 'italic' }}>
          No portraits to display.
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        fontFamily: 'serif',
        overflow: 'hidden',
      }}
    >
      {/* Paper grain */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Warm vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(15,10,6,0.10) 100%)',
        }}
      />

      {/* Gallery area — full height, no controls, no scroll */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <DustParticles />

        {/* Connection ornaments */}
        {selectedMember &&
          (() => {
            const sp = positions.get(selectedMember.id)
            if (!sp) return null
            const rp = display
              .filter((m) => relatedIds.has(m.id) && m.id !== selectedMember.id)
              .map((m) => positions.get(m.id))
              .filter((p): p is { x: number; y: number } => !!p)
            return <ConnectionOrnaments selectedPos={sp} relatedPositions={rp} viewW={dims.w} cy={safeArea.centerY} />
          })()}

        {/* Portraits */}
        {display.map((m, i) => {
          const pos = positions.get(m.id)
          if (!pos) return null
          const c = getChar(m, charMap)
          const img = c ? getCharacterPortrait(c.name) : getCharacterPortrait(m.name)
          const isSel = m.id === selectedMember?.id
          const isRel = relatedIds.has(m.id) && !isSel
          const depth = i <= 1 ? 0 : i <= 3 ? 1 : i <= 6 ? 2 : 3

          return (
            <div
              key={m.id}
              style={{
                position: 'absolute',
                left: pos.x - portraitSize / 2,
                top: pos.y - portraitSize / 2,
                width: portraitSize,
                height: portraitSize,
                transition:
                  'left 600ms cubic-bezier(0.23,1,0.32,1), top 600ms cubic-bezier(0.23,1,0.32,1), opacity 300ms ease',
                zIndex: isSel ? 5 : isRel ? 3 : depth < 2 ? 2 : 1,
                opacity: fading ? 0 : isSel ? 1 : isRel ? 0.85 : depth >= 3 && selectedMember ? 0.45 : 0.6,
                transform: fading ? 'scale(0.88)' : 'scale(1)',
              }}
            >
              <PortraitMedallion
                id={m.id}
                name={c?.name ?? m.name}
                imageUrl={img}
                isSelected={isSel}
                isRelated={isRel}
                isDeceased={m.isDeceased ?? false}
                isDimmed={selectedMember ? !isSel && !isRel : false}
                tier="medium"
                depth={depth}
                onClick={handleSelect}
                onHover={setHoveredId}
              />
              {/* Museum label — only on hover, not for selected */}
              {hoveredId === m.id && !isSel && <PortraitLabel member={m} character={c} familyName={family.name} />}
            </div>
          )
        })}
      </div>

      {/* Info panel — fixed height, no scroll */}
      {selectedMember && (
        <div
          ref={infoPanelRef}
          style={{
            flexShrink: 0,
            maxHeight: 'clamp(100px, 18vh, 180px)',
            animation: 'galleryInfoFadeIn 400ms ease',
            position: 'relative',
            zIndex: 5,
            overflow: 'hidden',
          }}
        >
          <CharacterInfoPanel
            member={selectedMember}
            character={selChar}
            familyName={family.name}
            parents={parents}
            spouse={spouse}
            children={children}
            siblings={siblings}
            books={books}
            onSelectMember={handleSelect}
          />
        </div>
      )}

      <style>{`
        @keyframes galleryInfoFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
