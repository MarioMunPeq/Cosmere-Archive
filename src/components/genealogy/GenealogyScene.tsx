import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture, DoubleSide } from 'three'
import type { Group, PerspectiveCamera as PC } from 'three'
import LecternModel3D from './LecternModel3D'
import ParchmentModel3D from './ParchmentModel3D'
import ParchmentSheet from './ParchmentSheet'
import Floor from './Floor'
import type { FamilyDefinition } from '@/types/family'
import type { Character } from '@/types/character'

const CAM_IDLE = [0, 1.7, 4] as const
const CAM_READ = [0, 1.9, 0.3] as const
const CAM_TARGET = [0, 0.88, 0.04] as const
const PARCHMENT_ANIM_DUR = 1.2
const CAM_ANIM_DUR = 1.5
const FLOATING_Y = 1.2

const LECTERN_POS: [number, number, number] = [0, 0.88, 0.04]
const LECTERN_ROT_X = 0.28
const FLOATING_ROT_X = -1.1

const FLOAT_W = 0.5
const FLOAT_H = 0.4
const FLOAT_THICK = 0.003

const FLOATING_POSITIONS: { x: number; z: number; yaw: number }[] = [
  { x: -0.7, z: 0.25, yaw: 0.2 },
  { x: -0.45, z: 0.4, yaw: 0.12 },
  { x: -0.2, z: 0.48, yaw: 0.05 },
  { x: 0, z: 0.5, yaw: 0 },
  { x: 0.2, z: 0.48, yaw: -0.05 },
  { x: 0.45, z: 0.4, yaw: -0.12 },
  { x: 0.7, z: 0.25, yaw: -0.2 },
]

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function createLabelTexture(name: string): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 340
  const ctx = c.getContext('2d')!

  ctx.fillStyle = '#f5efe6'
  ctx.fillRect(0, 0, 512, 340)

  const vig = ctx.createRadialGradient(256, 170, 60, 256, 170, 256)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(0.7, 'rgba(0,0,0,0.005)')
  vig.addColorStop(1, 'rgba(60,40,20,0.06)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, 512, 340)

  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 340
    ctx.strokeStyle = `rgba(120,100,80,${0.005 + Math.random() * 0.015})`
    ctx.lineWidth = 0.3 + Math.random() * 0.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + (Math.random() * 6 + 2), y)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(139,119,90,0.2)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(120, 80)
  ctx.lineTo(392, 80)
  ctx.stroke()

  ctx.fillStyle = '#1a0e06'
  ctx.font = 'bold 22px "Cormorant Garamond", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(name.toUpperCase(), 256, 140)

  ctx.fillStyle = '#6b5a4a'
  ctx.font = '12px "Cormorant Garamond", Georgia, serif'
  ctx.fillText('ARCHIVES OF BLOODLINES', 256, 210)

  ctx.strokeStyle = 'rgba(139,119,90,0.15)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(180, 240)
  ctx.lineTo(332, 240)
  ctx.stroke()

  return new CanvasTexture(c)
}

interface Props {
  selectedFamily: FamilyDefinition | null
  families: FamilyDefinition[]
  characters: Map<string, Character>
  charTitles: Map<string, string[]>
  detailId: string | null
  onSelectCharacter: (id: string) => void
  onSelectFamily: (id: string) => void
  onCloseDetail: () => void
}

interface AnimState {
  active: boolean
  progress: number
  approaching: boolean
}

export default function GenealogyScene({
  selectedFamily,
  families,
  characters,
  charTitles,
  detailId,
  onSelectCharacter,
  onSelectFamily,
  onCloseDetail,
}: Props) {
  const camera = useThree((s) => s.camera) as PC
  const camAnim = useRef<AnimState>({ active: false, progress: 0, approaching: true })

  const [animTarget, setAnimTarget] = useState<{
    familyId: string
    familyName: string
    fromPos: [number, number, number]
  } | null>(null)

  const animProgressRef = useRef(0)
  const movingGroupRef = useRef<Group>(null)
  const onSelectFamilyRef = useRef(onSelectFamily)
  useEffect(() => {
    onSelectFamilyRef.current = onSelectFamily
  }, [onSelectFamily])

  const isTransitioning = animTarget !== null
  const isIdle = selectedFamily === null && !isTransitioning

  const movingTex = useMemo(() => {
    if (!animTarget) return null
    return createLabelTexture(animTarget.familyName)
  }, [animTarget])

  const handleClickParchment = useCallback(
    (id: string, name: string, pos: [number, number, number]) => {
      if (!isIdle) return
      setAnimTarget({ familyId: id, familyName: name, fromPos: pos })
      animProgressRef.current = 0
      camAnim.current = { active: true, progress: 0, approaching: true }
    },
    [isIdle],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)

    // Camera approach/recede animation
    const anim = camAnim.current
    if (anim.active) {
      anim.progress = Math.min(anim.progress + dt / CAM_ANIM_DUR, 1)
      const t = easeOutCubic(anim.progress)

      const from = anim.approaching ? CAM_IDLE : CAM_READ
      const to = anim.approaching ? CAM_READ : CAM_IDLE

      camera.position.set(lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t))
      camera.lookAt(CAM_TARGET[0], CAM_TARGET[1], CAM_TARGET[2])
      camera.updateProjectionMatrix()

      if (anim.progress >= 1) {
        anim.active = false
      }
    }

    // Parchment flying animation (arrives slightly before camera settles)
    if (!animTarget) return
    animProgressRef.current = Math.min(animProgressRef.current + dt / PARCHMENT_ANIM_DUR, 1)
    const pt = easeOutCubic(animProgressRef.current)

    if (movingGroupRef.current) {
      movingGroupRef.current.position.set(
        lerp(animTarget.fromPos[0], LECTERN_POS[0], pt),
        lerp(animTarget.fromPos[1], LECTERN_POS[1], pt),
        lerp(animTarget.fromPos[2], LECTERN_POS[2], pt),
      )
      movingGroupRef.current.rotation.x = lerp(FLOATING_ROT_X, LECTERN_ROT_X, pt)
    }

    if (animProgressRef.current >= 1) {
      onSelectFamilyRef.current(animTarget.familyId)
      setAnimTarget(null)
    }
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 4]} intensity={0.9} color="#ffddbb" />
      <directionalLight position={[-2, 1, -1]} intensity={0.15} color="#ffe4cc" />
      <directionalLight position={[0, -1, 0]} intensity={0.05} color="#ffffff" />

      <Floor />
      <LecternModel3D />

      {/* Floating manuscripts — dimmed during transition, hidden during reading */}
      {families.map((f, i) => {
        const pos = FLOATING_POSITIONS[i] ?? { x: 0, z: 0, yaw: 0 }
        const isTarget = animTarget?.familyId === f.id
        const hideDuringReading = !isIdle && !isTransitioning
        return (
          <ParchmentSheet
            key={f.id}
            name={f.name}
            position={[pos.x, FLOATING_Y, pos.z]}
            yaw={pos.yaw}
            index={i}
            isDimmed={isTransitioning}
            hidden={isTarget || hideDuringReading}
            onClick={() => handleClickParchment(f.id, f.name, [pos.x, FLOATING_Y, pos.z])}
          />
        )
      })}

      {/* Moving parchment — from floating to lectern during transition */}
      {isTransitioning && movingTex && (
        <group ref={movingGroupRef} position={animTarget!.fromPos} rotation={[FLOATING_ROT_X, 0, 0]}>
          <mesh>
            <boxGeometry args={[FLOAT_W, FLOAT_THICK, FLOAT_H]} />
            <meshStandardMaterial
              map={movingTex}
              color="#f5efe6"
              roughness={0.85}
              metalness={0}
              side={DoubleSide}
              transparent
            />
          </mesh>
          <mesh position={[0, 0, -FLOAT_H / 2]}>
            <planeGeometry args={[FLOAT_W, FLOAT_THICK]} />
            <meshStandardMaterial color="#ddd0c0" roughness={0.9} metalness={0} transparent />
          </mesh>
        </group>
      )}

      {/* Active manuscript on lectern — appears after transition completes */}
      {!isIdle && selectedFamily && (
        <Suspense fallback={null}>
          <group position={LECTERN_POS} rotation={[LECTERN_ROT_X, 0, 0]}>
            <ParchmentModel3D
              family={selectedFamily}
              families={families}
              characters={characters}
              charTitles={charTitles}
              detailId={detailId}
              selectedId={detailId}
              onSelectCharacter={onSelectCharacter}
              onSelectFamily={onSelectFamily}
              onCloseDetail={onCloseDetail}
            />
          </group>
        </Suspense>
      )}
    </>
  )
}
