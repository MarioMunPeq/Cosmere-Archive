/** The archive opens at Khriss's working field table. */
import { useSEOMeta } from '@/hooks/useSEOMeta'
import ArchiveDoors from '@/components/landing/ArchiveDoors'

export default function LandingPage() {
  useSEOMeta({
    title: 'Cosmere Archive',
    description:
      'An archive of worlds, histories and shattered ideals from the Cosmere. Explore the Library, Biographical Records, Shadesmar, the Taravangian Diagram and Aharietiam.',
  })

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#100a06] md:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#352116_0%,#1c110b_44%,#100a06_85%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 border-b border-[#b28a54]/10 bg-gradient-to-b from-[#4b301d]/20 to-transparent"
      />
      <div className="relative z-10 h-full min-h-0 w-full">
        <ArchiveDoors />
      </div>
    </div>
  )
}
