import { useSEOMeta } from '@/hooks/useSEOMeta'
import CodexObject from '@/components/codex/CodexObject'
import Signature from '@/components/about/Signature'

const FACTS: [string, string][] = [
  ['Author', 'Mario Muñoz Pequeño'],
  ['Role', 'Multiplatform Application Developer'],
  ['Project', 'Personal Passion Project'],
  ['Status', 'Continuously Growing'],
]

const SOURCES: { name: string; url: string; note: string }[] = [
  {
    name: 'The Coppermind',
    url: 'https://coppermind.net',
    note: 'The community wiki this archive draws its canon from.',
  },
  {
    name: 'Brandon Sanderson',
    url: 'https://www.brandonsanderson.com',
    note: 'The author, whose published work is the source of everything here.',
  },
  {
    name: 'Way of the Shard',
    url: 'https://wob.coppermind.net',
    note: 'Words of Brandon: the primary record for anything unreleased.',
  },
]

const CONTACT: { name: string; url: string; handle: string }[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/MarioMunPeq',
    handle: '@MarioMunPeq',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/mario-mu%C3%B1oz-peque%C3%B1o/',
    handle: 'Mario Muñoz Pequeño',
  },
]

function DropCap({ children }: { children: string }) {
  const first = children.charAt(0)
  const rest = children.slice(1)
  return (
    <>
      <span
        className="float-left mr-[0.4em] mt-[0.08em] font-[var(--font-display)] text-[4.2em] leading-[0.8]"
        style={{
          fontFeatureSettings: '"ss01", "swsh"',
          color: '#2a1f14',
          textShadow: '1px 1px 0 rgba(90,70,45,0.08)',
        }}
      >
        {first}
      </span>
      {rest}
    </>
  )
}

function Rubric({ children }: { children: string }) {
  return (
    <span
      className="font-[var(--font-display)] italic tracking-[0.08em] uppercase text-[0.72em]"
      style={{ color: '#6b4a2a', fontFeatureSettings: '"smcp"' }}
    >
      {children}
    </span>
  )
}

function Marginalia({ children, style }: { children: string; style?: React.CSSProperties }) {
  return (
    <aside
      className="absolute -right-[clamp(36px,7vw,110px)] w-[clamp(150px,13vw,190px)] hidden xl:block font-[var(--font-hand)] text-[11px] leading-[1.7] rotate-[-1.5deg]"
      style={{
        top: 'var(--top, 40%)',
        color: '#58422c',
        textShadow: '0.25px 0.25px 0 rgba(80,60,40,0.1)',
        ...(style || {}),
      }}
    >
      <div className="relative">
        <div className="pl-2 italic opacity-90">{children}</div>
      </div>
    </aside>
  )
}

function Seal() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto mt-10" aria-hidden="true">
      <defs>
        <radialGradient id="sealGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#b08a4a" />
          <stop offset="70%" stopColor="#8b6b36" />
          <stop offset="100%" stopColor="#6a5329" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#sealGrad)" opacity="0.9" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="#d4b884" strokeWidth="1" opacity="0.4" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="#d4b884" strokeWidth="0.8" opacity="0.3" strokeDasharray="4 4" />
      <text x="32" y="30" textAnchor="middle" fontFamily="'EB Garamond Variable', Georgia, serif" fontSize="7" letterSpacing="0.24em" fill="#f2e6d0" style={{ textTransform: 'uppercase' }}>
        ARCHIVVM
      </text>
      <text x="32" y="40" textAnchor="middle" fontFamily="'EB Garamond Variable', Georgia, serif" fontSize="6" letterSpacing="0.32em" fill="#f2e6d0" style={{ textTransform: 'uppercase' }}>
        COSMERE
      </text>
      <path d="M32 14 L33.2 18 L37.5 18 L34.2 20.6 L35.4 24.6 L32 22 L28.6 24.6 L29.8 20.6 L26.5 18 L30.8 18 Z" fill="#f2e6d0" opacity="0.7" />
    </svg>
  )
}

function HandRule() {
  const paths = [
    'M 0 6 C 40 4, 80 8, 120 6 S 200 4, 280 6 S 340 8, 400 6',
    'M 10 10 C 60 12, 110 8, 170 10 S 250 12, 320 10 S 380 8, 400 10',
  ]
  return (
    <svg width="100%" height="16" viewBox="0 0 400 16" className="my-8 opacity-35" aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="#5a3d28" strokeWidth={i === 0 ? 1 : 0.8} fill="none" strokeLinecap="round" />
      ))}
    </svg>
  )
}

export default function About() {
  useSEOMeta({
    title: 'About the Archive — Cosmere Archive',
    description:
      "A personal project by Mario Muñoz Pequeño, inspired by Brandon Sanderson's Cosmere. Sources, rights and contact.",
  })

  return (
    <CodexObject>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-[clamp(12px,2vw,28px)]">
        <div className="relative flex h-full w-full max-w-[1500px] items-stretch justify-center">
          <div
            className="relative flex h-full w-full overflow-hidden shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)]"
            style={{
              backgroundColor: '#f2ece0',
              borderRadius: '2px',
              transform: 'rotateY(0.2deg)',
              perspective: '2000px',
            }}
          >
            {/* Paper stains */}
            <div className="pointer-events-none absolute left-0 top-0 z-[2] h-[70px] w-[70px] opacity-[0.07]" style={{ background: 'radial-gradient(ellipse at 0 0, rgba(120,90,60,0.5) 0%, transparent 70%)' }} />
            <div className="pointer-events-none absolute right-0 top-0 z-[2] h-[70px] w-[70px] opacity-[0.05]" style={{ background: 'radial-gradient(ellipse at 100% 0, rgba(120,90,60,0.4) 0%, transparent 70%)' }} />
            <div className="pointer-events-none absolute bottom-0 left-0 z-[2] h-[80px] w-[80px] opacity-[0.06]" style={{ background: 'radial-gradient(ellipse at 0 100%, rgba(100,80,50,0.4) 0%, transparent 70%)' }} />
            <div className="pointer-events-none absolute bottom-0 right-0 z-[2] h-[80px] w-[80px] opacity-[0.08]" style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(120,90,60,0.5) 0%, transparent 70%)' }} />

            {/* Central age stain */}
            <div className="pointer-events-none absolute inset-0 z-[2] opacity-[0.035]" style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(160,130,90,0.6) 0%, transparent 62%)' }} />

            {/* Left page */}
            <div className="relative flex h-full flex-1 flex-col overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 z-[3] w-[16px] pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(60,45,30,0.015) 30%, rgba(60,45,30,0.04) 60%, rgba(60,45,30,0.025) 100%)' }} />
              <header className="flex shrink-0 items-center gap-4 px-[clamp(36px,6vw,72px)] pt-[clamp(28px,6vh,56px)] pb-4">
                <span className="font-[var(--font-display)] text-[9px] uppercase tracking-[0.28em]" style={{ color: '#5a3d28' }}>About the Archive</span>
                <svg className="flex-1 h-[6px]" viewBox="0 0 200 6" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M 0 3 C 20 2, 40 4, 60 3 S 100 2, 140 3 S 180 4, 200 3" stroke="rgba(90,70,45,0.18)" strokeWidth="1" fill="none" strokeLinecap="round" />
                </svg>
              </header>
              <div className="relative flex-1 overflow-y-auto px-[clamp(36px,6vw,72px)] pb-[clamp(60px,10vh,90px)] pt-6 manuscript-scrollbar">
                <Marginalia style={{ ['--top' as any]: '18%' }}>built for the love of it</Marginalia>
                <Marginalia style={{ ['--top' as any]: '46%' }}>just a personal archive</Marginalia>
                <h1 className="mb-6 font-[var(--font-display)] text-[clamp(28px,4vw,44px)] tracking-[0.12em] uppercase" style={{ color: '#2a1f14' }}>
                  About the Archive
                </h1>
                <p className="mb-10 font-[var(--font-display)] text-[13px] italic" style={{ color: '#5a3d28' }}>
                  A personal project inspired by Brandon Sanderson's Cosmere.
                </p>
                <p className="mb-6 max-w-[var(--measure)] text-[15px] leading-[1.9] text-[#3a2a1a]">
                  <DropCap>Most</DropCap> software projects are started to solve a problem, or to fill a gap. This one was started because I wanted to build something I genuinely care about. The Cosmere became that project.
                </p>
                <p className="mb-6 max-w-[var(--measure)] text-[15px] leading-[1.9] text-[#3a2a1a]">
                  I wanted the archive I imagined as a reader — one that connects the books to the people, the people to the worlds, and the worlds to the history that shaped them — and that turned out to be the archive worth building.
                </p>
                <p className="mb-10 max-w-[var(--measure)] text-[15px] leading-[1.9] text-[#3a2a1a]">
                  This archive was never intended to compete with the remarkable work of communities like The Coppermind. It borrows from them generously and credits them below.
                </p>
                <HandRule />
                <section className="mt-10">
                  <Rubric>At a glance</Rubric>
                  <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
                    {FACTS.map(([term, value]) => (
                      <div key={term} className="flex items-baseline gap-4 border-b pb-2" style={{ borderColor: 'rgba(90,70,45,0.18)' }}>
                        <dt className="w-24 shrink-0 font-[var(--font-display)] text-[9px] uppercase tracking-[0.24em]" style={{ color: '#5a3d28' }}>{term}</dt>
                        <dd className="min-w-0 text-[15px]" style={{ color: '#2a1f14' }}>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <div className="mt-14 text-center">
                  <Seal />
                </div>
                <div className="mt-16 font-[var(--font-display)] text-[11px] uppercase tracking-[0.32em] text-center" style={{ color: '#6b4a2a' }}>— Finis Primae Paginae —</div>
              </div>
              <div className="absolute bottom-6 left-[clamp(36px,6vw,72px)] font-[var(--font-display)] text-[9px] italic" style={{ color: '#7a6040' }}>— i —</div>
            </div>

            {/* Spine */}
            <div className="relative w-[26px] shrink-0 self-stretch">
              <div className="h-full w-full" style={{ background: 'linear-gradient(180deg, rgba(80,60,40,0.06) 0%, rgba(60,45,30,0.12) 15%, rgba(50,35,20,0.16) 50%, rgba(60,45,30,0.12) 85%, rgba(80,60,40,0.06) 100%)' }} />
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2" style={{ background: 'rgba(50,35,20,0.14)' }} />
              <div className="absolute top-[18%] left-0 right-0 flex items-center justify-center gap-[6px]">
                <span className="h-[6px] w-[1.5px] rotate-[8deg]" style={{ background: 'rgba(60,45,30,0.16)' }} />
                <span className="h-[6px] w-[1.5px] rotate-[-8deg]" style={{ background: 'rgba(60,45,30,0.12)' }} />
                <span className="h-[6px] w-[1.5px] rotate-[5deg]" style={{ background: 'rgba(60,45,30,0.14)' }} />
              </div>
              <div className="absolute top-[50%] left-0 right-0 h-px" style={{ background: 'rgba(80,60,40,0.06)' }} />
              <div className="absolute top-[82%] left-0 right-0 flex items-center justify-center gap-[6px]">
                <span className="h-[6px] w-[1.5px] rotate-[-6deg]" style={{ background: 'rgba(60,45,30,0.14)' }} />
                <span className="h-[6px] w-[1.5px] rotate-[8deg]" style={{ background: 'rgba(60,45,30,0.12)' }} />
                <span className="h-[6px] w-[1.5px] rotate-[-5deg]" style={{ background: 'rgba(60,45,30,0.16)' }} />
              </div>
            </div>

            {/* Right page */}
            <div className="relative flex h-full flex-1 flex-col overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 z-[3] w-[16px] pointer-events-none" style={{ background: 'linear-gradient(270deg, transparent 0%, rgba(60,45,30,0.015) 30%, rgba(60,45,30,0.04) 60%, rgba(60,45,30,0.025) 100%)' }} />
              <header className="flex shrink-0 items-center gap-4 px-[clamp(36px,6vw,72px)] pt-[clamp(28px,6vh,56px)] pb-4">
                <svg className="flex-1 h-[6px]" viewBox="0 0 200 6" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M 0 3 C 30 4, 70 2, 110 3 S 170 4, 200 3" stroke="rgba(90,70,45,0.18)" strokeWidth="1" fill="none" strokeLinecap="round" />
                </svg>
                <span className="font-[var(--font-display)] text-[9px] uppercase tracking-[0.28em]" style={{ color: '#5a3d28' }}>Sources & Thanks</span>
              </header>
              <div className="relative flex-1 overflow-y-auto px-[clamp(36px,6vw,72px)] pb-[clamp(60px,10vh,90px)] pt-6 manuscript-scrollbar">
                <Marginalia style={{ ['--top' as any]: '16%' }}>owes so much to them</Marginalia>
                <Marginalia style={{ ['--top' as any]: '72%' }}>no money in this</Marginalia>
                <section>
                  <Rubric>Sources</Rubric>
                  <ul className="mt-6 space-y-6">
                    {SOURCES.map((source) => (
                      <li key={source.name}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-[var(--font-display)] text-[18px] tracking-[0.04em] underline decoration-[rgba(90,70,45,0.4)] underline-offset-8 transition-colors hover:text-[#1a140c]"
                          style={{ color: '#2a1f14' }}
                        >
                          {source.name}
                        </a>
                        <p className="mt-3 max-w-[var(--measure)] text-[15px] leading-[1.9]" style={{ color: '#3a2a1a' }}>{source.note}</p>
                      </li>
                    ))}
                  </ul>
                </section>
                <HandRule />
                <section className="mt-10">
                  <Rubric>Rights</Rubric>
                  <p className="mt-6 max-w-[var(--measure)] text-[15px] leading-[1.9]" style={{ color: '#3a2a1a' }}>
                    This is an educational project with no commercial intent. All rights to the Cosmere, its worlds and its characters belong to Brandon Sanderson.
                  </p>
                </section>
                <section className="mt-10">
                  <Rubric>Thanks</Rubric>
                  <p className="mt-6 max-w-[var(--measure)] text-[15px] leading-[1.9]" style={{ color: '#3a2a1a' }}>
                    Deep gratitude to the contributors of The Coppermind, whose meticulous work makes archives like this possible. Without their dedication, this project would not exist.
                  </p>
                </section>
                <HandRule />
                <section className="mt-10">
                  <Rubric>Contact</Rubric>
                  <ul className="mt-6 flex flex-wrap gap-6">
                    {CONTACT.map((c) => (
                      <li key={c.name}>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex min-h-[44px] items-center gap-3 font-[var(--font-display)] tracking-[0.06em] underline decoration-[rgba(90,70,45,0.4)] underline-offset-8 transition-colors hover:text-[#1a140c]"
                          style={{ color: '#2a1f14' }}
                        >
                          {c.name}
                          <span className="text-[13px] italic no-underline" style={{ color: '#5a3d28' }}>{c.handle}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-12">
                    <Signature />
                  </div>
                </section>
                <div className="mt-16 font-[var(--font-display)] text-[11px] uppercase tracking-[0.32em] text-center" style={{ color: '#6b4a2a' }}>— Finis Secundae Paginae —</div>
              </div>
              <div className="absolute bottom-6 right-[clamp(36px,6vw,72px)] font-[var(--font-display)] text-[9px] italic" style={{ color: '#7a6040' }}>— ii —</div>
            </div>
          </div>
        </div>
      </div>
    </CodexObject>
  )
}
