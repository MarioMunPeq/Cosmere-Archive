import { useSEOMeta } from '@/hooks/useSEOMeta'
import NazhChart from '@/components/mindmap/chart/NazhChart'

export default function MindMapPage() {
  useSEOMeta({
    title: "Nazh's Chart of the Cosmere — Cosmere Archive",
    description: "Nazh's Chart of the Cosmere",
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ background: '#170f07' }}>
      <div className="flex min-h-0 flex-1 flex-col">
        <NazhChart />
      </div>
    </div>
  )
}
