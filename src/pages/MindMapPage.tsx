import BackToMapButton from '@/components/ui/BackToMapButton'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import CosmereMindMap3D from '@/components/mindmap/CosmereMindMap3D'

export default function MindMapPage() {
  useSEOMeta({
    title: 'Cosmere Mind Map — Cosmere Archive',
    description:
      'Interactive 3D mind map showing the connections between planets, shards, characters, and books in the Cosmere',
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="absolute left-4 top-4 z-10">
        <BackToMapButton className="rounded-lg border border-gray-700/60 bg-gray-900/80 px-3 py-1.5 backdrop-blur-sm" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <CosmereMindMap3D />
      </div>
    </div>
  )
}
