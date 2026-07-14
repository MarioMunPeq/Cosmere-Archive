import { useSEOMeta } from '@/hooks/useSEOMeta'
import { Canvas } from '@/components/shadesmar/Canvas'

export default function ShadesmarPage() {
  useSEOMeta({
    title: 'Shadesmar — Cosmere Archive',
    description: 'The cognitive realm of the Cosmere — an endless ocean of glass beads connecting all worlds.',
  })

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: '#050508' }}>
      <Canvas />
    </div>
  )
}
