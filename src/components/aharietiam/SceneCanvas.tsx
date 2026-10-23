'use client'
import { memo, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  children: React.ReactNode
  light: boolean
  maxDpr: number
  onContextLost: () => void
  onPointerMissed?: () => void
}

export default memo(function SceneCanvas({ children, light, maxDpr, onContextLost, onPointerMissed }: Props) {
  const [active, setActive] = useState(true)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const contextLostRef = useRef<((event: Event) => void) | null>(null)
  const disposeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const onVisibility = () => setActive(document.visibilityState === 'visible')
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  /*
   * R3F force-loses the context after its own 500 ms teardown, but it does not
   * call WebGLRenderer.dispose(). Three leaves three context listeners on the
   * canvas, and this component leaves a fourth; the canvas then keeps the whole
   * detached page alive. Dispose the renderer after R3F has unmounted the scene
   * so the listeners and GPU caches are released with it.
   */
  useEffect(() => {
    if (disposeTimerRef.current !== null) {
      window.clearTimeout(disposeTimerRef.current)
      disposeTimerRef.current = null
    }
    return () => {
      const renderer = rendererRef.current
      const canvas = renderer?.domElement
      const onLost = contextLostRef.current
      if (canvas && onLost) canvas.removeEventListener('webglcontextlost', onLost)
      disposeTimerRef.current = window.setTimeout(() => {
        disposeTimerRef.current = null
        if (!renderer) return
        renderer.dispose()
        renderer.forceContextLoss()
        if (canvas) {
          canvas.width = 1
          canvas.height = 1
          canvas.remove()
        }
        rendererRef.current = null
        contextLostRef.current = null
      }, 650)
    }
  }, [])

  return (
    <Canvas
      dpr={[1, maxDpr]}
      frameloop={active ? 'always' : 'never'}
      shadows={light ? false : 'soft'}
      camera={{ fov: light ? 50 : 48, near: 0.12, far: 240, position: [0, 7.5, 15.6] }}
      gl={{
        antialias: !light,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.06,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor('#141922', 1)
        rendererRef.current = gl
        const canvas = gl.domElement
        const onLost = (event: Event) => {
          event.preventDefault()
          onContextLost()
        }
        contextLostRef.current = onLost
        canvas.addEventListener('webglcontextlost', onLost)
        canvas.dataset.renderDpr = String(gl.getPixelRatio())
        canvas.dataset.shadows = gl.shadowMap.enabled ? 'on' : 'off'
      }}
      onPointerMissed={() => onPointerMissed?.()}
      className="h-full w-full"
    >
      {children}
    </Canvas>
  )
})
