'use client'
import { memo, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createRng, makeTexture, paintRockbed } from './scene-textures'
import useDisposeOnUnmount from './useDisposeOnUnmount'
import { terrainHeightAt } from './terrain-height'

interface Props {
  light: boolean
}

interface Rock {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export default memo(function Ground({ light }: Props) {
  const segments = light ? 92 : 156
  const rockCount = light ? 44 : 104

  const { geometry, colourMap, bumpMap } = useMemo(() => {
    const terrain = new THREE.PlaneGeometry(190, 190, segments, segments)
    terrain.rotateX(-Math.PI / 2)

    const positions = terrain.attributes.position
    if (positions) {
      for (let index = 0; index < positions.count; index++) {
        const x = positions.getX(index)
        const z = positions.getZ(index)
        positions.setY(index, terrainHeightAt(x, z))
      }
      positions.needsUpdate = true
    }
    terrain.computeVertexNormals()

    const rockbed = paintRockbed()
    const colour = makeTexture(rockbed.colour, { repeat: 40, anisotropy: 8 })
    const bump = makeTexture(rockbed.bump, { srgb: false, repeat: 52, anisotropy: 8 })

    return { geometry: terrain, colourMap: colour, bumpMap: bump }
  }, [segments])

  const rockGeometry = useMemo(() => new THREE.DodecahedronGeometry(1, 0), [])
  const rockMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#6a5f52',
        roughness: 0.96,
        metalness: 0.02,
        envMapIntensity: 0.5,
      }),
    [],
  )

  useDisposeOnUnmount(() => {
    geometry.dispose()
    colourMap.dispose()
    bumpMap.dispose()
    rockGeometry.dispose()
    rockMaterial.dispose()
  })

  const rocks = useMemo<Rock[]>(() => {
    const rng = createRng(0x7a12c4)
    return Array.from({ length: rockCount }, () => {
      const angle = rng() * Math.PI * 2
      const radius = 9.5 + rng() * 30
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const scale = 0.14 + Math.pow(rng(), 2.2) * 1.15
      const scaleY = scale * (0.3 + rng() * 0.34)
      return {
        position: [x, terrainHeightAt(x, z) - scaleY * 0.3, z],
        rotation: [rng() * Math.PI, rng() * Math.PI * 2, rng() * Math.PI],
        scale: [scale, scaleY, scale * (0.75 + rng() * 0.5)],
      }
    })
  }, [rockCount])

  const rockRef = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = rockRef.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    for (let index = 0; index < rocks.length; index++) {
      const rock = rocks[index]
      if (!rock) continue
      dummy.position.set(rock.position[0], rock.position[1], rock.position[2])
      dummy.rotation.set(rock.rotation[0], rock.rotation[1], rock.rotation[2])
      dummy.scale.set(rock.scale[0], rock.scale[1], rock.scale[2])
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [rocks])

  return (
    <>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial
          map={colourMap}
          bumpMap={bumpMap}
          bumpScale={0.6}
          color="#d3ccc2"
          roughness={0.94}
          metalness={0.025}
          envMapIntensity={0.35}
        />
      </mesh>

      {/* A worn ring, almost lost in the shale, marks where the blades stand. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]} receiveShadow>
        <ringGeometry args={[5.85, 6.7, 128]} />
        <meshStandardMaterial
          color="#5b4e40"
          roughness={0.96}
          metalness={0.04}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      <instancedMesh ref={rockRef} args={[rockGeometry, rockMaterial, rockCount]} castShadow receiveShadow />
    </>
  )
})
