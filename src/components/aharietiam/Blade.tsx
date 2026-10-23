'use client'
import { memo, useMemo, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { HonorbladeData } from '@/types/aharietiam'
import {
  bladeCentreAt,
  bladeHalfWidthAt,
  bladeOutline,
  fullerOutline,
  guardOutline,
  ridgeOutline,
  type BladeForm,
  type BladePoint,
} from './blade-forms'
import { createRng, hashString, makeTexture, paintBladeSteel, paintGlyphPanel, paintGrip } from './scene-textures'
import useDisposeOnUnmount from './useDisposeOnUnmount'

interface Props {
  blade: HonorbladeData
  form: BladeForm
  position: [number, number, number]
  rotationY: number
  moundTexture: THREE.Texture
  edgeTexture: THREE.Texture
  pebbleCount: number
  selected: boolean
  /** True whenever any blade is open, so hovering does not restore the orbit cursor. */
  focused: boolean
  onSelect: () => void
}

const DRAG_SLOP = 8

/** The event owns the canvas element; no hook result is mutated. */
function setCanvasCursor(event: ThreeEvent<PointerEvent>, cursor: string): void {
  const target = event.nativeEvent.target
  if (target instanceof HTMLElement) target.style.cursor = cursor
}

function shapeFrom(points: readonly BladePoint[]): THREE.Shape {
  const shape = new THREE.Shape()
  let started = false
  for (const point of points) {
    if (!started) {
      shape.moveTo(point.x, point.y)
      started = true
    } else {
      shape.lineTo(point.x, point.y)
    }
  }
  shape.closePath()
  return shape
}

function flatGeometry(points: readonly BladePoint[]): THREE.ShapeGeometry {
  return new THREE.ShapeGeometry(shapeFrom(points))
}

function tint(base: string, accent: string, amount: number): string {
  return `#${new THREE.Color(base).lerp(new THREE.Color(accent), amount).getHexString()}`
}

interface Model {
  blade: THREE.ExtrudeGeometry
  fuller: THREE.ShapeGeometry
  ridge: THREE.ShapeGeometry
  guard: THREE.ExtrudeGeometry
  edgeFront: THREE.BufferGeometry
  edgeBack: THREE.BufferGeometry
  steelTexture: THREE.Texture
  gripTexture: THREE.Texture
  glyphTexture: THREE.Texture
  geometries: THREE.BufferGeometry[]
  textures: THREE.Texture[]
}

/**
 * A ribbon that follows the true edge of the silhouette, so the sheen never
 * floats off a curved or leaf-shaped blade. Two columns of vertices are enough.
 */
function buildEdgeRibbon(form: BladeForm, z: number): THREE.BufferGeometry {
  const from = 0.32
  const to = 0.9
  const steps = 14
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let index = 0; index <= steps; index++) {
    const t = from + (to - from) * (index / steps)
    const half = bladeHalfWidthAt(form, t)
    const centre = bladeCentreAt(form, t)
    const wave = form.waveAmplitude * Math.sin(t * Math.PI * 2 * form.waveCycles) * Math.min(1, t * 9)
    const outer = centre + half * (1 + form.asymmetry) + wave - 0.004
    const inner = outer - Math.min(0.03, Math.max(0.014, half * 0.22))
    const y = t * form.length
    const v = (t - from) / (to - from)
    positions.push(inner, y, z, outer, y, z)
    uvs.push(0.36, v, 0.5, v)
    if (index < steps) {
      const base = index * 2
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  return geometry
}

function buildModel(form: BladeForm): Model {
  const blade = new THREE.ExtrudeGeometry(shapeFrom(bladeOutline(form)), {
    depth: form.depth,
    bevelEnabled: true,
    bevelThickness: form.depth * 0.24,
    bevelSize: Math.min(0.012, form.halfWidth * 0.08),
    bevelSegments: 2,
    curveSegments: 4,
    steps: 1,
  })
  blade.translate(0, 0, -form.depth / 2)
  blade.computeVertexNormals()

  const guard = new THREE.ExtrudeGeometry(shapeFrom(guardOutline(form.guard, form.guardWidth)), {
    depth: form.guardDepth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.008,
    bevelSegments: 2,
    steps: 1,
  })
  guard.translate(0, 0, -form.guardDepth / 2)
  guard.computeVertexNormals()

  const gripTexture = makeTexture(paintGrip(form.grip, form.gripBands, hashString(`${form.id}-grip`)), {
    anisotropy: 4,
  })
  const glyphTexture = makeTexture(paintGlyphPanel(hashString(`${form.id}-glyph`)), { anisotropy: 4 })

  /* Extrude UVs are raw shape coordinates, so normalise them to the blade. */
  const steelTexture = makeTexture(paintBladeSteel(hashString(`${form.id}-steel`)), {
    srgb: false,
    anisotropy: 8,
  })
  steelTexture.wrapS = THREE.RepeatWrapping
  steelTexture.wrapT = THREE.RepeatWrapping
  steelTexture.repeat.set(1 / (Math.max(0.001, form.halfWidth) * 2), 1 / Math.max(0.001, form.length))
  steelTexture.offset.set(0.5, 0)

  const fuller = flatGeometry(fullerOutline(form))
  const ridge = flatGeometry(ridgeOutline(form))
  const edgeFront = buildEdgeRibbon(form, form.depth / 2 + 0.004)
  const edgeBack = buildEdgeRibbon(form, -form.depth / 2 - 0.004)

  return {
    blade,
    fuller,
    ridge,
    guard,
    edgeFront,
    edgeBack,
    steelTexture,
    gripTexture,
    glyphTexture,
    geometries: [blade, fuller, ridge, guard, edgeFront, edgeBack],
    textures: [steelTexture, gripTexture, glyphTexture],
  }
}

function Pommel({ form, position, trim, accent }: { form: BladeForm; position: number; trim: string; accent: string }) {
  const radius = form.pommelSize
  const metal = <meshStandardMaterial color={trim} metalness={0.82} roughness={0.3} envMapIntensity={1.3} />
  const jewel = (
    <meshStandardMaterial
      color={accent}
      metalness={0.55}
      roughness={0.22}
      emissive={accent}
      emissiveIntensity={0.18}
      envMapIntensity={1.1}
    />
  )

  switch (form.pommel) {
    case 'orb':
      return (
        <mesh position={[0, position, 0]} castShadow>
          <sphereGeometry args={[radius, 18, 14]} />
          {metal}
        </mesh>
      )
    case 'disc':
      return (
        <mesh position={[0, position, 0]} castShadow>
          <cylinderGeometry args={[radius, radius * 0.9, radius * 0.45, 22]} />
          {metal}
        </mesh>
      )
    case 'ring':
      return (
        <mesh position={[0, position + radius * 0.55, 0]} castShadow>
          <torusGeometry args={[radius * 0.72, radius * 0.24, 12, 24]} />
          {metal}
        </mesh>
      )
    case 'octa':
      return (
        <mesh position={[0, position, 0]} castShadow>
          <octahedronGeometry args={[radius, 0]} />
          {metal}
        </mesh>
      )
    case 'gem':
      return (
        <mesh position={[0, position, 0]} castShadow>
          <icosahedronGeometry args={[radius, 0]} />
          {jewel}
        </mesh>
      )
    case 'cone':
      return (
        <mesh position={[0, position, 0]} castShadow>
          <coneGeometry args={[radius * 0.78, radius * 1.8, 14]} />
          {metal}
        </mesh>
      )
    case 'cube':
      return (
        <mesh position={[0, position, 0]} rotation={[0.12, 0.35, 0.08]} castShadow>
          <boxGeometry args={[radius * 1.35, radius * 1.35, radius * 1.35]} />
          {metal}
        </mesh>
      )
    case 'tear':
      return (
        <mesh position={[0, position, 0]} scale={[0.8, 1.45, 0.8]} castShadow>
          <sphereGeometry args={[radius, 16, 12]} />
          {metal}
        </mesh>
      )
    case 'knot':
      return (
        <mesh position={[0, position, 0]} castShadow>
          <torusKnotGeometry args={[radius * 0.6, radius * 0.18, 48, 8]} />
          {metal}
        </mesh>
      )
    case 'sun':
      return (
        <group position={[0, position, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[radius * 0.72, 16, 12]} />
            {metal}
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius * 1.05, radius * 0.11, 8, 24]} />
            {metal}
          </mesh>
        </group>
      )
  }
}

export default memo(function Blade({
  blade,
  form,
  position,
  rotationY,
  moundTexture,
  edgeTexture,
  pebbleCount,
  selected,
  focused,
  onSelect,
}: Props) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const model = useMemo(() => buildModel(form), [form])
  useDisposeOnUnmount(() => {
    for (const geometry of model.geometries) geometry.dispose()
    for (const texture of model.textures) texture.dispose()
  })

  const colours = useMemo(
    () => ({
      blade: tint('#aeb7c1', blade.color, 0.04),
      edge: tint('#dbe0e5', blade.color, 0.02),
      fuller: tint('#5c636d', blade.color, 0.06),
      guard: tint('#969c9e', blade.color, 0.1),
      trim: tint('#b3aea4', blade.color, 0.28),
      accent: blade.color,
    }),
    [blade.color],
  )

  const glow = useMemo(() => tint('#ffffff', blade.color, 0.35), [blade.color])

  const pebbles = useMemo(() => {
    const rng = createRng(hashString(`${form.id}-stones`))
    return Array.from({ length: pebbleCount }, () => {
      const angle = rng() * Math.PI * 2
      const radius = (0.2 + rng() * 0.46) * form.moundScale
      const size = 0.024 + rng() * 0.044
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        y: form.sink + size * 0.28,
        size,
        rotation: [rng() * 0.7, rng() * Math.PI, rng() * 0.6] as [number, number, number],
      }
    })
  }, [form.id, form.moundScale, form.sink, pebbleCount])

  const glyphT = form.glyphT
  const glyphWidth = Math.min(form.halfWidth * 1.25, 0.205)
  const glyphHeight = glyphWidth * 2
  const glyphX = bladeCentreAt(form, glyphT)
  const faceZ = form.depth / 2 + 0.0012

  const gripBottom = form.length + 0.15
  const gripCentre = gripBottom + form.gripLength / 2
  const pommelY = gripBottom + form.gripLength + form.pommelSize * 0.8

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY }
    setCanvasCursor(event, 'pointer')
  }

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start) return
    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    if (distance > DRAG_SLOP) return
    event.stopPropagation()
    onSelect()
  }

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    setCanvasCursor(event, 'pointer')
  }

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    setCanvasCursor(event, focused ? 'default' : 'grab')
  }

  const handlePointerCancel = () => {
    pointerStart.current = null
  }

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerCancel={handlePointerCancel}
    >
      {/* A generous, invisible target so a blade can be chosen by touch. */}
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.46, 0.52, 3.9, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      <group rotation={[form.tiltX, 0, form.tiltZ]}>
        {/* The blade itself, point down into the rock. */}
        <mesh geometry={model.blade} castShadow receiveShadow>
          <meshStandardMaterial
            color={colours.blade}
            metalness={0.88}
            roughness={0.5}
            roughnessMap={model.steelTexture}
            envMapIntensity={selected ? 1.45 : 1.2}
          />
        </mesh>

        {/* The fuller reads as a groove because it is darker and inset a hair. */}
        <mesh geometry={model.fuller} position={[0, 0, faceZ]}>
          <meshStandardMaterial color={colours.fuller} metalness={0.75} roughness={0.5} envMapIntensity={0.85} />
        </mesh>
        <mesh geometry={model.fuller} position={[0, 0, -faceZ]} rotation={[0, Math.PI, 0]}>
          <meshStandardMaterial color={colours.fuller} metalness={0.75} roughness={0.5} envMapIntensity={0.85} />
        </mesh>

        {/* A raised ridge, bright where the horizon catches it. */}
        <mesh geometry={model.ridge} position={[0, 0, faceZ + 0.0004]}>
          <meshStandardMaterial color={colours.edge} metalness={0.94} roughness={0.22} envMapIntensity={1.4} />
        </mesh>
        <mesh geometry={model.ridge} position={[0, 0, -faceZ - 0.0004]} rotation={[0, Math.PI, 0]}>
          <meshStandardMaterial color={colours.edge} metalness={0.94} roughness={0.22} envMapIntensity={1.4} />
        </mesh>

        {/* Herald glyphs, etched into both faces. */}
        <mesh position={[glyphX, glyphT * form.length, faceZ + 0.0009]}>
          <planeGeometry args={[glyphWidth, glyphHeight]} />
          <meshBasicMaterial
            map={model.glyphTexture}
            color={colours.accent}
            transparent
            opacity={0.58}
            depthWrite={false}
            side={THREE.FrontSide}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[glyphX, glyphT * form.length, -faceZ - 0.0009]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[glyphWidth, glyphHeight]} />
          <meshBasicMaterial
            map={model.glyphTexture}
            color={colours.accent}
            transparent
            opacity={0.45}
            depthWrite={false}
            side={THREE.FrontSide}
            toneMapped={false}
          />
        </mesh>

        {/* The selected blade catches a narrow sheen along its true edge. No beam. */}
        {selected ? (
          <>
            <mesh geometry={model.edgeFront} renderOrder={5}>
              <meshBasicMaterial
                map={edgeTexture}
                color={glow}
                transparent
                opacity={0.82}
                depthWrite={false}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
            <mesh geometry={model.edgeBack} renderOrder={5}>
              <meshBasicMaterial
                map={edgeTexture}
                color={glow}
                transparent
                opacity={0.5}
                depthWrite={false}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
            <pointLight position={[0, form.length * 0.56, 0.7]} color={glow} intensity={2.3} distance={4.6} decay={2} />
            <pointLight position={[0, 0.4, 0.5]} color={glow} intensity={0.65} distance={2.2} decay={2} />
          </>
        ) : null}

        {/* Crossguard: its profile is one of ten separate silhouettes. */}
        <mesh geometry={model.guard} position={[0, form.length, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={colours.guard} metalness={0.85} roughness={0.38} envMapIntensity={1.1} />
        </mesh>

        {/* A restrained jewel at the guard's heart carries the Herald's colour. */}
        <mesh position={[0, form.length + 0.035, form.guardDepth / 2 + 0.008]}>
          <sphereGeometry args={[0.028, 12, 10]} />
          <meshStandardMaterial
            color={colours.accent}
            metalness={0.6}
            roughness={0.2}
            emissive={colours.accent}
            emissiveIntensity={0.28}
            envMapIntensity={1.1}
          />
        </mesh>

        {/* Grip: a painted sleeve with two metal ferrules. */}
        <mesh position={[0, gripCentre, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[form.gripRadius, form.gripRadius * 1.06, form.gripLength, 14, 1]} />
          <meshStandardMaterial map={model.gripTexture} roughness={0.74} metalness={0.12} envMapIntensity={0.6} />
        </mesh>
        <mesh position={[0, gripBottom + 0.025, 0]} castShadow>
          <cylinderGeometry args={[form.gripRadius * 1.17, form.gripRadius * 1.17, 0.045, 16]} />
          <meshStandardMaterial color={colours.trim} metalness={0.82} roughness={0.28} envMapIntensity={1.3} />
        </mesh>
        <mesh position={[0, gripBottom + form.gripLength - 0.025, 0]} castShadow>
          <cylinderGeometry args={[form.gripRadius * 1.15, form.gripRadius * 1.15, 0.04, 16]} />
          <meshStandardMaterial color={colours.trim} metalness={0.82} roughness={0.28} envMapIntensity={1.3} />
        </mesh>

        <Pommel form={form} position={pommelY} trim={colours.trim} accent={colours.accent} />
      </group>

      {selected ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, 0]} renderOrder={4}>
          <ringGeometry args={[0.84 + form.moundScale * 0.12, 0.9 + form.moundScale * 0.13, 56]} />
          <meshBasicMaterial
            color={glow}
            transparent
            opacity={0.24}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ) : null}

      {/* Disturbed earth: a low mound, a cracked stain and a handful of stones. */}
      <mesh
        position={[0, form.sink + 0.012, 0]}
        scale={[0.5 * form.moundScale, 0.1 * form.moundScale, 0.44 * form.moundScale]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#2f241a" roughness={1} metalness={0} flatShading envMapIntensity={0.15} />
      </mesh>
      <mesh
        position={[0, form.sink + 0.007, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={1.05 * form.moundScale}
        renderOrder={2}
      >
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial
          map={moundTexture}
          transparent
          depthWrite={false}
          opacity={0.55}
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
      {pebbles.map((pebble, index) => (
        <mesh
          key={index}
          position={[pebble.x, pebble.y, pebble.z]}
          rotation={pebble.rotation}
          scale={[pebble.size, pebble.size * 0.62, pebble.size * 0.82]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#4e3f30" roughness={0.98} metalness={0.02} />
        </mesh>
      ))}
    </group>
  )
})
