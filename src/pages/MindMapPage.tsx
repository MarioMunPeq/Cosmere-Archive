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
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--surface-void)]">
      <div className="absolute left-4 top-4 z-10">
        <BackToMapButton className="border border-[#5a3e1e] bg-[#2a180c] px-3 py-1.5 font-[var(--font-display)] text-[12px] text-[#d8b878] shadow-[0_2px_6px_rgba(0,0,0,0.4)]" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <CosmereMindMap3D />
      </div>
    </div>
  )
}
