'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

export default function Atmosphere() {
  const fogMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vWorldPos;
          void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: `
          varying vec3 vWorldPos;
          uniform vec3 cameraPos;
          uniform float opacity;
          void main() {
            vec3 dir = normalize(vWorldPos - cameraPos);
            float heightFactor = 1.0 - abs(dir.y);
            float distFactor = length(vWorldPos - cameraPos) / 20.0;
            float fog = clamp(heightFactor * distFactor * 0.6, 0.0, 1.0);
            gl_FragColor = vec4(0.01, 0.005, 0.04, fog * 0.5);
          }
        `,
        uniforms: {
          cameraPos: { value: new THREE.Vector3() },
          opacity: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [],
  )

  return (
    <mesh scale={[30, 30, 30]}>
      <sphereGeometry args={[1, 32, 32]} />
      <primitive object={fogMat} attach="material" />
    </mesh>
  )
}
