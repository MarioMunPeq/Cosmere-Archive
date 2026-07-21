import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import type { FamilyDefinition } from '@/types/family'
import type { Character } from '@/types/character'
import { computeUnifiedLayout, NODE_R } from './LayoutEngine'
import { createCamera, cameraTick, cameraPan, cameraPanInertia, cameraZoom, cameraFitBounds } from './Camera'
import { PortraitNode } from './PortraitNode'
import { InkLine } from './InkLine'
import { CatalogEntry } from './CatalogEntry'
import { getCharacterPortrait } from '@/utils'

interface Props {
  families: FamilyDefinition[]
  characters: Character[]
  focusFamilyId?: string
  onSelectMember: (memberId: string, charId?: string) => void
  charMap: Map<string, Character>
}

const charByName = (chars: Character[], name: string) =>
  chars.find((c) => c.name.toLowerCase() === name.toLowerCase()) ?? null

export function GenealogyManuscript({ families, characters, focusFamilyId, onSelectMember, charMap }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const lastMouse = useRef({ x: 0, y: 0 })
  const viewSize = useRef({ w: 800, h: 600 })
  const hadInitialFit = useRef(false)

  const [viewW, setViewW] = useState(800)
  const [viewH, setViewH] = useState(600)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cam, setCam] = useState(() => createCamera(0, 0, 1))

  const layout = useMemo(() => computeUnifiedLayout(families, charMap), [families, charMap])
  const activeFamily = focusFamilyId ? families.find((f) => f.id === focusFamilyId) : families[0]

  /* ── Focus family change ── */
  const prevFamilyRef = useRef(focusFamilyId)
  useEffect(() => {
    if (!focusFamilyId) return
    if (focusFamilyId === prevFamilyRef.current) return
    prevFamilyRef.current = focusFamilyId
    setSelectedId(null)
    const fb = layout.familyBounds.get(focusFamilyId)
    if (fb) {
      setCam((prev) => cameraFitBounds(prev, fb.x, fb.y, fb.w, fb.h, viewSize.current.w, viewSize.current.h, 0.92))
    }
  }, [focusFamilyId, layout.familyBounds])

  /* ── Setup & resize — initial fit fills the page ── */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      viewSize.current = { w: width, h: height }
      setViewW(width)
      setViewH(height)
      /* Only auto-fit once on mount, then let the user explore */
      if (!hadInitialFit.current && focusFamilyId) {
        hadInitialFit.current = true
        const fb = layout.familyBounds.get(focusFamilyId)
        if (fb) {
          setCam((prev) => cameraFitBounds(prev, fb.x, fb.y, fb.w, fb.h, width, height, 0.92))
        }
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Camera RAF loop ── */
  useEffect(() => {
    let lastT = performance.now()
    let killed = false
    const loop = (now: number) => {
      if (killed) return
      const dt = Math.min((now - lastT) / 1000, 0.04)
      lastT = now
      setCam((prev) => cameraTick(prev, dt, { w: layout.worldW, h: layout.worldH }, viewW, viewH))
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      killed = true
      cancelAnimationFrame(rafRef.current)
    }
  }, [layout.worldW, layout.worldH, viewW, viewH])

  /* ── Pointer handlers — no grab cursor, like turning a page ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    dragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }
    setCam((prev) => cameraPan(prev, dx, dy))
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    dragging.current = false
    const totalDx = e.clientX - dragStart.current.x
    const totalDy = e.clientY - dragStart.current.y
    if (Math.abs(totalDx) > 4 || Math.abs(totalDy) > 4) {
      setCam((prev) => cameraPanInertia(prev, totalDx, totalDy))
    }
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setCam((prev) => cameraZoom(prev, e.deltaY, e.clientX - rect.left, e.clientY - rect.top))
  }, [])

  /* ── Node selection ── */
  const selectNode = useCallback(
    (id: string) => {
      setSelectedId((prev) => (prev === id ? null : id))
      const member = layout.memberData.get(id)
      if (member) {
        onSelectMember(member.id, member.characterId)
        const p = layout.positions.get(id)
        if (p) {
          setCam((prev) =>
            cameraFitBounds(
              prev,
              p.x - NODE_R * 1.2,
              p.y - NODE_R * 1.5,
              NODE_R * 2.4,
              NODE_R * 3,
              viewSize.current.w,
              viewSize.current.h,
              0.6,
            ),
          )
        }
      }
    },
    [layout, onSelectMember],
  )

  type DisplayNode = {
    id: string
    pos: { x: number; y: number }
    name: string
    char: Character | null
    isDeceased?: boolean
    importance: number
  }

  /* ── Display nodes ── */
  const displayNodes = useMemo((): DisplayNode[] => {
    if (!activeFamily) return []
    const out: DisplayNode[] = []
    for (const m of activeFamily.members) {
      const pos = layout.positions.get(m.id)
      if (!pos) continue
      const char = m.characterId ? (charMap.get(m.characterId) ?? null) : charByName(characters, m.name)
      out.push({
        id: m.id,
        pos,
        name: char?.name ?? m.name,
        char,
        isDeceased: m.isDeceased,
        importance: char?.description ? (char.description.length > 120 ? 1 : 0.5) : 0,
      })
    }
    return out
  }, [activeFamily, layout.positions, charMap, characters])

  /* ── Selected catalog ── */
  const selectedMember = useMemo(() => {
    if (!selectedId) return null
    return layout.memberData.get(selectedId) ?? null
  }, [selectedId, layout.memberData])

  const selectedCharacter = useMemo(() => {
    if (!selectedMember || !selectedMember.characterId) return null
    return charMap.get(selectedMember.characterId) ?? null
  }, [selectedMember, charMap])

  const catalogData = useMemo(() => {
    if (!selectedMember) return null
    return {
      member: selectedMember,
      character: selectedCharacter,
      familyName: activeFamily?.name ?? '',
      parents: (selectedMember.parentIds ?? []).map((id) => layout.memberData.get(id)).filter(Boolean) as Array<
        NonNullable<typeof selectedMember>
      >,
      spouse: selectedMember.spouseId ? (layout.memberData.get(selectedMember.spouseId) ?? null) : null,
      children: layout.connections
        .filter((c) => c.type === 'parent-child' && c.from === selectedMember.id)
        .map((c) => layout.memberData.get(c.to))
        .filter(Boolean) as Array<NonNullable<typeof selectedMember>>,
      books: selectedCharacter?.requiredBooks ?? [],
    }
  }, [selectedMember, selectedCharacter, activeFamily, layout])

  if (!activeFamily) return null

  const tf = `translate(${-cam.x * cam.scale + viewW / 2},${-cam.y * cam.scale + viewH / 2}) scale(${cam.scale})`

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
      {/* SVG tree — the only thing on this page */}
      <svg width={viewW} height={viewH} style={{ display: 'block' }}>
        <g transform={tf}>
          {layout.connections
            .filter((c) => activeFamily.members.some((m) => m.id === c.from))
            .map((c) => (
              <InkLine
                key={`${c.from}-${c.to}`}
                fromX={c.fromX}
                fromY={c.fromY}
                toX={c.toX}
                toY={c.toY}
                type={c.type}
                isHighlighted={c.from === selectedId || c.to === selectedId}
              />
            ))}
          {displayNodes.map((n) => {
            const isSelected = n.id === selectedId
            const isHovered = n.id === hoverId
            const isDimmed =
              selectedId != null &&
              !isSelected &&
              !layout.connections.some(
                (c) => (c.from === selectedId && c.to === n.id) || (c.to === selectedId && c.from === n.id),
              )
            return (
              <PortraitNode
                key={n.id}
                id={n.id}
                pos={n.pos}
                name={n.name}
                imageUrl={n.char ? getCharacterPortrait(n.char.name) : null}
                isDeceased={n.isDeceased}
                isSelected={isSelected}
                isHovered={isHovered}
                isDimmed={isDimmed}
                importance={n.importance}
                onClick={selectNode}
                onHover={setHoverId}
              />
            )
          })}
        </g>
      </svg>

      {/* Catalog annotation — only appears on selection */}
      {catalogData && (
        <div
          style={{
            position: 'absolute',
            right: 10,
            top: 24,
            zIndex: 3,
            width: 280,
            maxHeight: 'calc(100% - 48px)',
            overflowY: 'auto',
            pointerEvents: 'auto',
          }}
        >
          <CatalogEntry {...catalogData} onClose={() => setSelectedId(null)} />
        </div>
      )}
    </div>
  )
}
