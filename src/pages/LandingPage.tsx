import { useSEOMeta } from '@/hooks/useSEOMeta'
import { Manuscript, ArchiveDust } from '@/components/landing'
import { getWoodTexture } from '@/utils/textures'

export default function LandingPage() {
  useSEOMeta({
    title: 'Cosmere Archive',
    description: 'An interactive repository of worlds, stories and forgotten knowledge from the Cosmere universe.',
  })

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto"
      style={{
        backgroundColor: '#1f1209',
        backgroundImage: `url("${getWoodTexture()}")`,
        backgroundSize: '512px 512px',
        backgroundRepeat: 'repeat',
      }}
    >
      {/* Warm ambient spotlight behind manuscript */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 'clamp(600px, 70vw, 1100px)',
          height: 'clamp(500px, 60vw, 900px)',
          background:
            'radial-gradient(ellipse at center, rgba(200,160,90,0.06) 0%, rgba(180,140,80,0.02) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <ArchiveDust />

      <div className="relative z-10 flex w-full flex-col items-center px-4 py-16">
        <Manuscript />
      </div>
    </div>
  )
}
