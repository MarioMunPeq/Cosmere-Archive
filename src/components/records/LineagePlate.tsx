/**
 * LineagePlate — the fold-out bloodline chart for Volume II.
 *
 * The plate is an engraving, not a diagram widget: round portrait medallions,
 * names printed under them, hand-inked branches and a gold-leaf marriage line.
 * It is laid out once at its natural size, then scaled to fit the page so the
 * reader can see the whole house without a scrollbar. Panning and zooming are
 * available for study, but the opening state always shows every member.
 */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { initialsOf } from '@/components/common/Monogram'
import { ALL_CHARACTERS, SHARD_COLORS } from '@/data/static'
import { getCharacterPortrait } from '@/utils/character-portrait'
import { computePlateLayout, parentNodesOf, spouseNodeOf, type PlateNode } from '@/utils/genealogy-plate-layout'
import type { Character } from '@/types/character'
import type { FamilyDefinition } from '@/types/family'

interface Props {
  family: FamilyDefinition
  onOpenCharacter: (characterId: string) => void
}

interface View {
  scale: number
  x: number
  y: number
}

interface Viewport {
  width: number
  height: number
}

function viewReducer(_state: View, next: View): View {
  return next
}

function viewportReducer(state: Viewport, next: Viewport): Viewport {
  return state.width === next.width && state.height === next.height ? state : next
}

interface DragState {
  pointerId: number
  startX: number
  startY: number
  startView: View
  moved: boolean
}

interface PinchState {
  startDistance: number
  startCenterX: number
  startCenterY: number
  startView: View
}

interface Branch {
  key: string
  d: string
  delay: number
}

interface Marriage {
  key: string
  top: string
  bottom: string
  ornamentX: number
  ornamentY: number
}

const CHARACTERS_BY_ID = new Map(ALL_CHARACTERS.map((character) => [character.id, character]))
const HOUSE_ROOT = /\b(?:house|houses|circle|crowns|dynasty|kin)\b/i
const PAGE_MARGIN_X = 10
const PAGE_MARGIN_TOP = 8
const PAGE_MARGIN_BOTTOM = 36
const CONTENT_WIDTH = 72
const CONTENT_WIDTH_COMPACT = 62
const WHEEL_SENSITIVITY = 0.0015
const PAN_THRESHOLD = 4
const INK = '#3e2c1a'
const BRASS = '#9a7428'

function localPoint(element: HTMLElement, clientX: number, clientY: number) {
  const rect = element.getBoundingClientRect()
  return { x: clientX - rect.left, y: clientY - rect.top }
}

/**
 * Names are printed under a medallion only 72px wide, so every multi-word name
 * gets two balanced lines. Splitting on the widest possible first line would
 * give "Gavilar Kholin" a single 14px line wider than its own portrait.
 */
function splitLabel(name: string): string[] {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length <= 1) return [name.trim()]

  let bestIndex = 1
  let bestLongest = Number.POSITIVE_INFINITY
  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(' ')
    const second = words.slice(index).join(' ')
    const longest = Math.max(first.length, second.length)
    // On a tie, prefer the split that leaves more words on the first line:
    // "Queen of / Idris" reads better than "Queen / of Idris".
    if (longest < bestLongest || (longest === bestLongest && index > bestIndex)) {
      bestLongest = longest
      bestIndex = index
    }
  }

  return [words.slice(0, bestIndex).join(' '), words.slice(bestIndex).join(' ')]
}

function memberIsDeceased(member: PlateNode['member'], character: Character | undefined): boolean {
  return Boolean(member.isDeceased || character?.status === 'deceased')
}

function yearOrTitle(character: Character | undefined, deceased: boolean): string | null {
  if (!character) return null

  if (typeof character.born === 'number' && character.born >= 0) {
    if (deceased && typeof character.died === 'number') return `${character.born}–${character.died}`
    return `b. ${character.born}`
  }

  return character.titles?.[0] ?? null
}

function portraitFor(member: PlateNode['member'], character: Character | undefined): string | null {
  if (character) return getCharacterPortrait(character.name)
  return getCharacterPortrait(member.name)
}

function isHouseCrest(family: FamilyDefinition, node: PlateNode, portrait: string | null): boolean {
  return (
    !node.member.characterId &&
    !portrait &&
    family.rootIds.includes(node.member.id) &&
    HOUSE_ROOT.test(node.member.name)
  )
}

function HouseCrestMark({ family, size }: { family: FamilyDefinition; size: number }) {
  const seed = [...family.id].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  const spokes = 6 + (seed % 5)
  const radius = size / 2

  return (
    <g fill="none" stroke={INK} strokeLinecap="round" aria-hidden="true">
      <circle cx={0} cy={0} r={radius * 0.9} strokeOpacity="0.56" strokeWidth="0.9" />
      <circle cx={0} cy={0} r={radius * 0.65} strokeOpacity="0.34" strokeWidth="0.7" />
      {Array.from({ length: spokes }, (_, index) => {
        const angle = (index / spokes) * Math.PI * 2 - Math.PI / 2
        return (
          <line
            key={index}
            x1={Math.cos(angle) * radius * 0.28}
            y1={Math.sin(angle) * radius * 0.28}
            x2={Math.cos(angle) * radius * 0.76}
            y2={Math.sin(angle) * radius * 0.76}
            strokeOpacity="0.62"
            strokeWidth="0.8"
          />
        )
      })}
      <circle
        cx={0}
        cy={0}
        r={radius * 0.14}
        fill={family.color}
        fillOpacity="0.82"
        stroke={INK}
        strokeOpacity="0.38"
        strokeWidth="0.5"
      />
    </g>
  )
}

function MonogramWell({
  initials,
  accent,
  radius,
  deceased,
}: {
  initials: string
  accent: string
  radius: number
  deceased: boolean
}) {
  const letterSize = initials.length > 1 ? radius * 0.58 : radius * 0.7

  return (
    <g aria-hidden="true" opacity={deceased ? 0.84 : 1}>
      <circle cx={0} cy={0} r={radius} fill="var(--surface-page-inset)" />
      <circle cx={0} cy={0} r={radius} fill={accent} fillOpacity="0.16" />
      <circle cx={0} cy={0} r={radius * 0.72} fill={accent} fillOpacity="0.08" />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display)"
        fontSize={letterSize}
        letterSpacing="0.04em"
        fill={INK}
        fillOpacity="0.82"
      >
        {initials}
      </text>
    </g>
  )
}

export default function LineagePlate({ family, onOpenCharacter }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<View>({ scale: 1, x: 0, y: 0 })
  const dragRef = useRef<DragState | null>(null)
  const pinchRef = useRef<PinchState | null>(null)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const suppressClickRef = useRef(false)

  const [viewport, setViewport] = useReducer(viewportReducer, { width: 0, height: 0 })
  const [dragging, setDragging] = useState(false)
  const [failedPortraits, setFailedPortraits] = useState<ReadonlySet<string>>(() => new Set())

  const rawId = useId()
  const prefix = `lineage-${rawId.replace(/[^a-zA-Z0-9_-]/g, '') || 'plate'}`
  const filterId = `${prefix}-engrave`

  const measured = viewport.width > 0 && viewport.height > 0
  const compact = measured && viewport.width < 340
  const layout = useMemo(
    () =>
      computePlateLayout(family, {
        medallion: compact ? 56 : 72,
        nodeWidth: compact ? CONTENT_WIDTH_COMPACT : CONTENT_WIDTH,
      }),
    [compact, family],
  )

  const availableWidth = Math.max(1, viewport.width - PAGE_MARGIN_X * 2)
  const availableHeight = Math.max(1, viewport.height - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM)
  const fitScale = measured
    ? Math.max(0.001, Math.min(1, availableWidth / layout.width, availableHeight / layout.height))
    : 1
  const maxScale = Math.max(2.4, fitScale * 4.25)

  const fitView = useMemo<View>(() => {
    if (!measured) return { scale: 1, x: 0, y: 0 }
    const scaledWidth = layout.width * fitScale
    const scaledHeight = layout.height * fitScale
    return {
      scale: fitScale,
      x: PAGE_MARGIN_X + Math.max(0, (availableWidth - scaledWidth) / 2),
      y: PAGE_MARGIN_TOP + Math.max(0, (availableHeight - scaledHeight) / 2),
    }
  }, [availableHeight, availableWidth, fitScale, layout.height, layout.width, measured])

  const [view, setView] = useReducer(viewReducer, fitView)

  const clampView = useCallback(
    (candidate: View): View => {
      const scale = Math.min(maxScale, Math.max(fitScale, candidate.scale))
      const scaledWidth = layout.width * scale
      const scaledHeight = layout.height * scale

      const x =
        scaledWidth <= availableWidth
          ? PAGE_MARGIN_X + (availableWidth - scaledWidth) / 2
          : Math.min(PAGE_MARGIN_X, Math.max(viewport.width - PAGE_MARGIN_X - scaledWidth, candidate.x))

      const y =
        scaledHeight <= availableHeight
          ? PAGE_MARGIN_TOP + (availableHeight - scaledHeight) / 2
          : Math.min(PAGE_MARGIN_TOP, Math.max(viewport.height - PAGE_MARGIN_BOTTOM - scaledHeight, candidate.y))

      return { scale, x, y }
    },
    [availableHeight, availableWidth, fitScale, layout.height, layout.width, maxScale, viewport.height, viewport.width],
  )

  const applyView = useCallback(
    (candidate: View) => {
      const next = clampView(candidate)
      viewRef.current = next
      setView(next)
    },
    [clampView],
  )

  useLayoutEffect(() => {
    const element = hostRef.current
    if (!element) return

    const update = () => {
      const rect = element.getBoundingClientRect()
      const width = Math.round(rect.width)
      const height = Math.round(rect.height)
      if (width <= 0 || height <= 0) return
      setViewport({ width, height })
    }

    update()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }

    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Opening a house, or resizing the page, returns to the whole-tree view.
  useLayoutEffect(() => {
    viewRef.current = fitView
    setView(fitView)
  }, [family.id, fitView])

  useEffect(() => {
    const element = hostRef.current
    if (!element) return

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 0.01) return
      event.preventDefault()

      const point = localPoint(element, event.clientX, event.clientY)
      const current = viewRef.current
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : 1)
      const target = current.scale * Math.exp(-delta * WHEEL_SENSITIVITY)
      const scale = Math.min(maxScale, Math.max(fitScale, target))
      const ratio = scale / current.scale

      applyView({
        scale,
        x: point.x - (point.x - current.x) * ratio,
        y: point.y - (point.y - current.y) * ratio,
      })
    }

    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [applyView, fitScale, maxScale])

  const medallionRadius = layout.medallion / 2

  const branches = useMemo<Branch[]>(() => {
    const groups = new Map<string, { parents: PlateNode[]; children: PlateNode[] }>()

    for (const node of layout.nodes) {
      const parents = parentNodesOf(node, layout.nodes)
      if (parents.length === 0) continue
      const key = parents
        .map((parent) => parent.member.id)
        .sort()
        .join('|')
      const group = groups.get(key)
      if (group) group.children.push(node)
      else groups.set(key, { parents, children: [node] })
    }

    const result: Branch[] = []
    for (const [key, group] of groups) {
      const startX = group.parents.reduce((sum, parent) => sum + parent.cx, 0) / group.parents.length
      const parentBottom = Math.max(...group.parents.map((parent) => parent.y + layout.nodeHeight))
      // Branches live in the row gap, beneath the printed names. They drop from
      // the couple's midpoint (or the single parent's centre) without striking
      // a line through any text.
      const startY = parentBottom
      const busY = startY + 6
      const generation = Math.min(...group.parents.map((parent) => parent.row))
      const baseDelay = 110 + generation * 120

      result.push({
        key: `${key}-trunk`,
        d: `M ${startX} ${startY} C ${startX - 0.8} ${startY + 2}, ${startX + 0.8} ${busY - 2}, ${startX} ${busY}`,
        delay: baseDelay,
      })

      group.children
        .slice()
        .sort((a, b) => a.cx - b.cx)
        .forEach((child, index) => {
          const targetX = child.cx
          const targetY = child.cy - medallionRadius
          const controlY = busY + (targetY - busY) * 0.48
          result.push({
            key: `${key}-${child.member.id}`,
            d: `M ${startX} ${busY} C ${startX} ${controlY}, ${targetX} ${controlY}, ${targetX} ${targetY}`,
            delay: baseDelay + 36 + index * 34,
          })
        })
    }

    return result
  }, [layout.nodeHeight, layout.nodes, medallionRadius])

  const marriages = useMemo<Marriage[]>(() => {
    const seen = new Set<string>()
    const result: Marriage[] = []

    const addMarriage = (a: PlateNode, b: PlateNode) => {
      const pair = [a.member.id, b.member.id].sort().join('|')
      if (seen.has(pair) || a.row !== b.row) return
      seen.add(pair)

      const left = a.cx <= b.cx ? a : b
      const right = a.cx <= b.cx ? b : a
      const x1 = left.cx + medallionRadius + 4
      const x2 = right.cx - medallionRadius - 4
      if (x2 <= x1) return

      const y = (left.cy + right.cy) / 2
      const middleX = (x1 + x2) / 2
      result.push({
        key: pair,
        top: `M ${x1} ${y - 1.4} Q ${middleX} ${y - 4.4} ${x2} ${y - 1.4}`,
        bottom: `M ${x1} ${y + 1.4} Q ${middleX} ${y + 4.4} ${x2} ${y + 1.4}`,
        ornamentX: middleX,
        ornamentY: y,
      })
    }

    for (const node of layout.nodes) {
      const spouse = spouseNodeOf(node, layout.nodes)
      if (spouse) addMarriage(node, spouse)
    }

    // Some houses record the parents only on the child. Two co-parents in the
    // same generation are still a marriage, even when neither spouseId is set.
    for (const node of layout.nodes) {
      const parents = parentNodesOf(node, layout.nodes)
      if (parents.length === 2 && Math.abs(parents[0]!.column - parents[1]!.column) === 1) {
        addMarriage(parents[0]!, parents[1]!)
      }
    }

    return result
  }, [layout.nodes, medallionRadius])

  const srRows = useMemo(() => {
    // The chart infers a marriage between co-parents even when spouseId is
    // missing, so the spoken mirror has to know the partner's name as well.
    const coParentNames = new Map<string, Set<string>>()
    const addCoParent = (id: string, name: string) => {
      const names = coParentNames.get(id)
      if (names) names.add(name)
      else coParentNames.set(id, new Set([name]))
    }

    for (const node of layout.nodes) {
      const parents = parentNodesOf(node, layout.nodes)
      if (parents.length !== 2) continue
      const [first, second] = parents
      if (!first || !second) continue
      addCoParent(first.member.id, second.member.name)
      addCoParent(second.member.id, first.member.name)
    }

    return layout.nodes.map((node) => {
      const parents = parentNodesOf(node, layout.nodes).map((parent) => parent.member.name)
      const spouse = spouseNodeOf(node, layout.nodes)?.member.name
      const coParents = [...(coParentNames.get(node.member.id) ?? [])]
      const character = node.member.characterId ? CHARACTERS_BY_ID.get(node.member.characterId) : undefined
      const crest = isHouseCrest(family, node, portraitFor(node.member, character))
      const status = crest
        ? 'House crest.'
        : memberIsDeceased(node.member, character)
          ? 'Deceased.'
          : character?.status === 'unknown'
            ? 'Status unknown.'
            : 'Living.'
      const parentLine =
        parents.length > 0
          ? parents.length === 1
            ? `Child of ${parents[0]}.`
            : `Child of ${parents.slice(0, -1).join(', ')} and ${parents[parents.length - 1]}.`
          : family.rootIds.includes(node.member.id)
            ? 'Founder of the house.'
            : spouse || coParents.length > 0
              ? 'Married into the house.'
              : 'Founder of the house.'
      const spouseLine = spouse
        ? ` Married to ${spouse}.`
        : coParents.length > 0
          ? ` Married to ${coParents.join(' and ')}.`
          : ''
      const recordLine = node.member.characterId ? ' A record is available.' : ''
      return {
        id: node.member.id,
        text: `${node.member.name}. ${status} ${parentLine}${spouseLine}${recordLine}`,
      }
    })
  }, [family, layout.nodes])

  const focusNode = useCallback((familyId: string, memberId: string) => {
    document.getElementById(`lineage-node-${familyId}-${memberId}`)?.focus()
  }, [])

  const onNodeKeyDown = (event: ReactKeyboardEvent<SVGGElement>, node: PlateNode) => {
    const sameGeneration = layout.nodes
      .filter((candidate) => candidate.row === node.row && candidate.member.characterId)
      .sort((a, b) => a.cx - b.cx)
    const index = sameGeneration.findIndex((candidate) => candidate.member.id === node.member.id)

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const next = sameGeneration[index + (event.key === 'ArrowRight' ? 1 : -1)]
      if (!next) return
      event.preventDefault()
      focusNode(family.id, next.member.id)
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      const next = sameGeneration[event.key === 'Home' ? 0 : sameGeneration.length - 1]
      if (!next) return
      event.preventDefault()
      focusNode(family.id, next.member.id)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (node.member.characterId) onOpenCharacter(node.member.characterId)
    }
  }

  const capturePointer = (pointerId: number) => {
    try {
      hostRef.current?.setPointerCapture(pointerId)
    } catch {
      // The pointer may already have been released.
    }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (event.target instanceof Element && event.target.closest('[data-lineage-control]')) return

    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    setDragging(true)

    if (pointersRef.current.size === 1) {
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startView: viewRef.current,
        moved: false,
      }
      pinchRef.current = null
      return
    }

    if (pointersRef.current.size === 2) {
      const points = [...pointersRef.current.values()]
      const centerX = (points[0]!.x + points[1]!.x) / 2
      const centerY = (points[0]!.y + points[1]!.y) / 2
      const local = localPoint(event.currentTarget, centerX, centerY)
      pinchRef.current = {
        startDistance: Math.max(1, Math.hypot(points[0]!.x - points[1]!.x, points[0]!.y - points[1]!.y)),
        startCenterX: local.x,
        startCenterY: local.y,
        startView: viewRef.current,
      }
      dragRef.current = null
      suppressClickRef.current = true
      for (const pointerId of pointersRef.current.keys()) capturePointer(pointerId)
    }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pinchRef.current && pointersRef.current.size >= 2) {
      const points = [...pointersRef.current.values()]
      const centerX = (points[0]!.x + points[1]!.x) / 2
      const centerY = (points[0]!.y + points[1]!.y) / 2
      const local = localPoint(event.currentTarget, centerX, centerY)
      const distance = Math.hypot(points[0]!.x - points[1]!.x, points[0]!.y - points[1]!.y)
      const factor = distance / pinchRef.current.startDistance
      const target = pinchRef.current.startView.scale * factor
      const scale = Math.min(maxScale, Math.max(fitScale, target))
      const ratio = scale / pinchRef.current.startView.scale

      applyView({
        scale,
        x: local.x - (pinchRef.current.startCenterX - pinchRef.current.startView.x) * ratio,
        y: local.y - (pinchRef.current.startCenterY - pinchRef.current.startView.y) * ratio,
      })
      return
    }

    let drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY

    if (!drag.moved && Math.hypot(deltaX, deltaY) > PAN_THRESHOLD) {
      drag = { ...drag, moved: true }
      dragRef.current = drag
      suppressClickRef.current = true
      capturePointer(event.pointerId)
    }

    if (!drag.moved) return

    applyView({
      scale: drag.startView.scale,
      x: drag.startView.x + deltaX,
      y: drag.startView.y + deltaY,
    })
  }

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId)

    try {
      hostRef.current?.releasePointerCapture(event.pointerId)
    } catch {
      // The pointer may not be captured.
    }

    if (pointersRef.current.size === 0) {
      dragRef.current = null
      pinchRef.current = null
      setDragging(false)
      if (suppressClickRef.current) {
        window.setTimeout(() => {
          suppressClickRef.current = false
        }, 0)
      }
      return
    }

    const remaining = [...pointersRef.current.entries()][0]
    if (remaining) {
      pinchRef.current = null
      dragRef.current = {
        pointerId: remaining[0],
        startX: remaining[1].x,
        startY: remaining[1].y,
        startView: viewRef.current,
        moved: true,
      }
    }
  }

  // A release outside the page still ends the gesture; without this the plate
  // can be left stuck in its grabbing state after a long pan.
  useEffect(() => {
    if (!dragging) return

    const release = (event: PointerEvent) => {
      pointersRef.current.delete(event.pointerId)
      if (pointersRef.current.size > 0) return

      dragRef.current = null
      pinchRef.current = null
      setDragging(false)
      if (suppressClickRef.current) {
        window.setTimeout(() => {
          suppressClickRef.current = false
        }, 0)
      }
    }

    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    return () => {
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
    }
  }, [dragging])

  const onClickCapture = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (!suppressClickRef.current) return
    suppressClickRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  const zoomBy = (factor: number) => {
    const current = viewRef.current
    const scale = Math.min(maxScale, Math.max(fitScale, current.scale * factor))
    const ratio = scale / current.scale
    const centerX = PAGE_MARGIN_X + availableWidth / 2
    const centerY = PAGE_MARGIN_TOP + availableHeight / 2
    applyView({
      scale,
      x: centerX - (centerX - current.x) * ratio,
      y: centerY - (centerY - current.y) * ratio,
    })
  }

  const fit = () => {
    viewRef.current = fitView
    setView(fitView)
  }

  return (
    <div
      className="lineage-plate"
      data-bloodlines={family.id}
      data-lineage-plate
      data-compact={compact || undefined}
      data-ready={measured ? 'true' : undefined}
    >
      <div className="lineage-plate__head" aria-hidden="true">
        <span className="lineage-plate__kicker">Fold-out chart</span>
        <span className="lineage-plate__count">
          {family.members.length} {family.members.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      <div
        ref={hostRef}
        className="lineage-plate__viewport"
        data-codex-interactive
        data-ready={measured ? 'true' : undefined}
        data-dragging={dragging ? 'true' : undefined}
        role="region"
        aria-label={`${family.name} family tree`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
      >
        <div
          className="lineage-plate__canvas"
          data-lineage-canvas
          style={
            {
              width: layout.width,
              height: layout.height,
              opacity: measured ? 1 : 0,
              transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
              '--lineage-engrave': `url(#${filterId})`,
            } as CSSProperties
          }
        >
          <svg
            className="lineage-plate__ink"
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            width={layout.width}
            height={layout.height}
            role="group"
            aria-label={`${family.name} family tree drawing`}
            onClickCapture={onClickCapture}
          >
            <defs>
              <filter id={filterId} x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
                <feColorMatrix type="saturate" values="0.42" result="desaturated" />
                <feColorMatrix
                  in="desaturated"
                  type="matrix"
                  values="0.52 0.30 0.10 0 0.04
                          0.22 0.52 0.12 0 0.03
                          0.12 0.22 0.36 0 0.02
                          0    0    0    1 0"
                />
              </filter>
            </defs>

            <g aria-hidden="true">
              {marriages.map((marriage) => (
                <g key={marriage.key}>
                  <path
                    d={marriage.top}
                    fill="none"
                    stroke={BRASS}
                    strokeWidth="0.7"
                    strokeOpacity="0.82"
                    strokeLinecap="round"
                  />
                  <path
                    d={marriage.bottom}
                    fill="none"
                    stroke={BRASS}
                    strokeWidth="0.7"
                    strokeOpacity="0.82"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${marriage.ornamentX} ${marriage.ornamentY - 4.8} L ${marriage.ornamentX + 3.8} ${marriage.ornamentY} L ${marriage.ornamentX} ${marriage.ornamentY + 4.8} L ${marriage.ornamentX - 3.8} ${marriage.ornamentY} Z`}
                    fill="none"
                    stroke={BRASS}
                    strokeWidth="0.8"
                    strokeOpacity="0.85"
                  />
                  <circle cx={marriage.ornamentX - 7} cy={marriage.ornamentY} r="0.7" fill={BRASS} fillOpacity="0.7" />
                  <circle cx={marriage.ornamentX + 7} cy={marriage.ornamentY} r="0.7" fill={BRASS} fillOpacity="0.7" />
                </g>
              ))}
            </g>

            <g aria-hidden="true" className="lineage-branches">
              {branches.map((branch) => {
                const style = { '--lineage-delay': `${branch.delay}ms` } as CSSProperties
                return (
                  <g key={branch.key}>
                    <path
                      className="lineage-branch lineage-branch--bleed"
                      d={branch.d}
                      pathLength={1}
                      transform="translate(-0.25 0)"
                      fill="none"
                      stroke={INK}
                      strokeWidth="2.6"
                      strokeOpacity="0.09"
                      strokeLinecap="round"
                      style={style}
                    />
                    <path
                      className="lineage-branch"
                      d={branch.d}
                      pathLength={1}
                      fill="none"
                      stroke={INK}
                      strokeWidth="1.25"
                      strokeOpacity="0.76"
                      strokeLinecap="round"
                      style={style}
                    />
                    <path
                      className="lineage-branch lineage-branch--hair"
                      d={branch.d}
                      pathLength={1}
                      transform="translate(0.35 0)"
                      fill="none"
                      stroke={INK}
                      strokeWidth="0.45"
                      strokeOpacity="0.48"
                      strokeLinecap="round"
                      style={style}
                    />
                  </g>
                )
              })}
            </g>

            {layout.nodes.map((node) => {
              const characterId = node.member.characterId
              const character = characterId ? CHARACTERS_BY_ID.get(characterId) : undefined
              const portrait = portraitFor(node.member, character)
              const failed = failedPortraits.has(node.member.id)
              const crest = isHouseCrest(family, node, portrait)
              const interactive = Boolean(characterId)
              const deceased = memberIsDeceased(node.member, character)
              const accent =
                (character?.planet ? SHARD_COLORS[character.planet] : undefined) ?? family.color ?? '#8a7a62'
              const subtitle = yearOrTitle(character, deceased)
              const lines = splitLabel(node.member.name)
              const nameY = layout.medallion + (compact ? 12 : 15)
              const lineHeight = compact ? 13 : 15
              const subtitleY = nameY + (lines.length - 1) * lineHeight + (compact ? 12 : 14)
              const label = crest
                ? `${node.member.name}, house crest`
                : `${node.member.name}${deceased ? ', deceased' : ''}${interactive ? '. Opens their record' : ''}`

              return (
                <g
                  key={node.member.id}
                  id={`lineage-node-${family.id}-${node.member.id}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  role={interactive ? 'button' : 'img'}
                  tabIndex={interactive ? 0 : undefined}
                  aria-label={label}
                  data-lineage-node={node.member.id}
                  data-lineage-root={crest || undefined}
                  onClick={characterId ? () => onOpenCharacter(characterId) : undefined}
                  onKeyDown={interactive ? (event) => onNodeKeyDown(event, node) : undefined}
                  className={interactive ? 'lineage-node lineage-node--interactive' : 'lineage-node'}
                >
                  <circle
                    cx={layout.nodeWidth / 2}
                    cy={layout.medallion / 2}
                    r={medallionRadius}
                    fill="var(--surface-page-inset)"
                  />

                  {crest ? (
                    <g transform={`translate(${layout.nodeWidth / 2}, ${layout.medallion / 2})`}>
                      <HouseCrestMark family={family} size={medallionRadius * 1.7} />
                    </g>
                  ) : portrait && !failed ? (
                    <foreignObject
                      x={layout.nodeWidth / 2 - medallionRadius}
                      y={0}
                      width={medallionRadius * 2}
                      height={medallionRadius * 2}
                      aria-hidden="true"
                    >
                      <div className="lineage-medallion__photo">
                        <img
                          src={portrait}
                          alt=""
                          loading="eager"
                          decoding="async"
                          draggable={false}
                          onError={() => {
                            setFailedPortraits((current) => {
                              if (current.has(node.member.id)) return current
                              const next = new Set(current)
                              next.add(node.member.id)
                              return next
                            })
                          }}
                        />
                      </div>
                    </foreignObject>
                  ) : (
                    <g transform={`translate(${layout.nodeWidth / 2}, ${layout.medallion / 2})`}>
                      <MonogramWell
                        initials={initialsOf(node.member.name)}
                        accent={accent}
                        radius={medallionRadius}
                        deceased={deceased}
                      />
                    </g>
                  )}

                  <circle
                    cx={layout.nodeWidth / 2}
                    cy={layout.medallion / 2}
                    r={medallionRadius - 2.5}
                    fill="none"
                    stroke={INK}
                    strokeWidth="0.45"
                    strokeOpacity="0.32"
                    aria-hidden="true"
                  />
                  <circle
                    cx={layout.nodeWidth / 2}
                    cy={layout.medallion / 2}
                    r={medallionRadius + 0.45}
                    fill="none"
                    stroke={INK}
                    strokeWidth="0.9"
                    strokeOpacity="0.72"
                    aria-hidden="true"
                  />
                  <circle
                    cx={layout.nodeWidth / 2}
                    cy={layout.medallion / 2}
                    r={medallionRadius + 2.7}
                    fill="none"
                    stroke={BRASS}
                    strokeWidth="0.7"
                    strokeOpacity="0.5"
                    aria-hidden="true"
                  />
                  {interactive && (
                    <circle
                      className="lineage-medallion__focus"
                      cx={layout.nodeWidth / 2}
                      cy={layout.medallion / 2}
                      r={medallionRadius + 5.5}
                      fill="none"
                      stroke={INK}
                      strokeWidth="1.5"
                      aria-hidden="true"
                    />
                  )}

                  {lines.map((line, index) => (
                    <text
                      key={line}
                      x={layout.nodeWidth / 2}
                      y={nameY + index * lineHeight}
                      textAnchor="middle"
                      fontFamily="var(--font-display)"
                      fontSize={compact ? 13 : 14}
                      fontWeight={600}
                      letterSpacing="0.035em"
                      style={{ fontVariantCaps: 'small-caps' }}
                      fill="var(--text-on-page-primary)"
                    >
                      {line}
                      {index === lines.length - 1 && deceased && !crest && (
                        <tspan dx="3" fontSize={12} fill="var(--text-on-page-secondary)">
                          †
                        </tspan>
                      )}
                    </text>
                  ))}

                  {subtitle && (
                    <text
                      x={layout.nodeWidth / 2}
                      y={subtitleY}
                      textAnchor="middle"
                      fontFamily="var(--font-display)"
                      fontSize={13}
                      fontStyle="italic"
                      fill="var(--text-on-page-secondary)"
                    >
                      {subtitle}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <div
          className="lineage-plate__controls"
          data-lineage-control
          role="group"
          aria-label={`${family.name} chart controls`}
        >
          <button
            type="button"
            className="lineage-plate__control"
            data-lineage-control
            aria-label={`Zoom in on the ${family.name} tree`}
            onClick={() => zoomBy(1.24)}
          >
            +
          </button>
          <button
            type="button"
            className="lineage-plate__control"
            data-lineage-control
            aria-label={`Zoom out of the ${family.name} tree`}
            onClick={() => zoomBy(0.8)}
          >
            −
          </button>
          <button
            type="button"
            className="lineage-plate__control"
            data-lineage-control
            aria-label={`Fit the whole ${family.name} tree on the page`}
            onClick={fit}
          >
            fit
          </button>
        </div>
      </div>

      <ul className="sr-only" aria-label={`${family.name} members`}>
        {srRows.map((row) => (
          <li key={row.id}>{row.text}</li>
        ))}
      </ul>
    </div>
  )
}
