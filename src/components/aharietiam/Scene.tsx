'use client'
import { memo, useState, useCallback } from 'react'
import SceneCanvas from './SceneCanvas'
import Ground3D from './Ground3D'
import BladeRing3D from './BladeRing3D'
import SceneLights from './SceneLights'
import Atmosphere from './Atmosphere'
import Particles from './Particles'
import InfoMonolith from './InfoMonolith'
import { HONORBLADES } from '@/data/static/aharietiam'

export default memo(function Scene() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedBlade = selectedId
    ? HONORBLADES.find((h) => h.id === selectedId) ?? null
    : null

  const handleSelectBlade = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedId(null)
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#030205' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <Atmosphere />
      </div>

      <div className="fixed inset-0" style={{ zIndex: 2 }}>
        <SceneCanvas>
          <SceneLights />
          <Ground3D />
          <BladeRing3D
            onSelectBlade={handleSelectBlade}
            selectedBlade={selectedId}
          />
        </SceneCanvas>
      </div>

      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <Particles />
      </div>

      <InfoMonolith
        blade={
          selectedBlade
            ? {
                id: selectedBlade.id,
                name: selectedBlade.name,
                title: selectedBlade.title,
                order: selectedBlade.order,
                surges: selectedBlade.surges,
                description: selectedBlade.description,
                books: selectedBlade.books,
                connections: selectedBlade.connections,
                status: selectedBlade.status,
              }
            : null
        }
        onClose={handleClose}
      />
    </div>
  )
})
