import { useCallback } from 'react'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import { getPaperTexture } from '@/utils/textures'

interface Chapter {
  numeral: string
  title: string
  description: string
  annotation: string
  to: string
}

const CHAPTERS: Chapter[] = [
  {
    numeral: 'I',
    title: 'JASNAH LIBRARY',
    description: 'Collected written records of the Cosmere.',
    annotation: 'Fol. 1–8',
    to: '/library',
  },
  {
    numeral: 'II',
    title: 'WORLD MAP',
    description: 'Cartographic records of planets, systems and civilizations.',
    annotation: 'Fol. 9–16',
    to: '/locations',
  },
  {
    numeral: 'III',
    title: 'TARAVANGIAN DIAGRAM',
    description: 'Recovered calculations, predictions and hidden patterns.',
    annotation: 'Fol. 17–24',
    to: '/stats',
  },
  {
    numeral: 'IV',
    title: 'PEOPLE',
    description: 'Characters, families and historical figures.',
    annotation: 'Fol. 25–32',
    to: '/characters',
  },
  {
    numeral: 'V',
    title: 'AHARIETIAM',
    description: 'The ceremonial circle of abandoned Honorblades.',
    annotation: 'Fol. 33–38',
    to: '/aharietiam',
  },
  {
    numeral: 'VI',
    title: 'MAGIC SYSTEMS',
    description: 'Studies of Investiture and related phenomena.',
    annotation: 'Fol. 39–46',
    to: '/magic',
  },
  {
    numeral: 'VII',
    title: 'TIMELINE',
    description: 'Chronological archive of important events.',
    annotation: 'Fol. 47–54',
    to: '/timeline',
  },
  {
    numeral: 'VIII',
    title: 'RELATIONSHIPS',
    description: 'Genealogical and connection records.',
    annotation: 'Fol. 55–60',
    to: '/characters?tab=relationships',
  },
  {
    numeral: 'IX',
    title: 'MIND MAP',
    description: 'Knowledge connections across the archive.',
    annotation: 'Fol. 61–66',
    to: '/mind-map',
  },
]

const COLS: Chapter[][] = [CHAPTERS.slice(0, 5), CHAPTERS.slice(5, 9)]

export default function Manuscript() {
  const navigate = useViewTransitionNavigate()

  const handleClick = useCallback(
    (to: string) => {
      navigate(to)
    },
    [navigate],
  )

  return (
    <div
      className="animate-manuscript-enter relative w-full max-w-[880px]"
      style={{
        boxShadow:
          '0 1px 3px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.14), 0 24px 64px rgba(0,0,0,0.18), inset 0 0 0 0.5px rgba(255,255,255,0.25)',
      }}
    >
      {/* ── Paper body ── */}
      <div
        style={{
          backgroundImage: `url("${getPaperTexture()}")`,
          backgroundSize: '512px 512px',
          borderRadius: '2px',
          border: '0.5px solid rgba(160,140,110,0.18)',
        }}
      >
        {/* Bottom edge (page thickness) */}
        <div
          className="pointer-events-none absolute -bottom-[1px] left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, rgba(200,180,160,0.3), rgba(180,160,140,0.15), rgba(200,180,160,0.3))',
            borderRadius: '0 0 2px 2px',
          }}
        />

        <div className="px-12 py-12 sm:px-16 sm:py-14">
          {/* ── Title ── */}
          <div className="animate-title-reveal text-center">
            <h1
              className="font-serif text-[clamp(22px,3vw,36px)] tracking-[0.22em] font-bold leading-tight"
              style={{
                color: '#6a5a3a',
                textShadow: '0 1px 1px rgba(0,0,0,0.10)',
                letterSpacing: '0.22em',
              }}
            >
              COSMERE ARCHIVE
            </h1>
            <p
              className="mt-3 font-serif text-[clamp(11px,1.1vw,14px)] italic leading-relaxed tracking-[0.06em]"
              style={{ color: '#8a7a6a' }}
            >
              An interactive repository of worlds, stories and forgotten knowledge.
            </p>
          </div>

          {/* ── Decorative rule ── */}
          <div className="relative my-8 flex items-center justify-center sm:my-9">
            <div
              className="absolute left-1/2 top-1/2 h-[0.5px] w-full -translate-x-1/2"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(160,140,110,0.25), transparent)' }}
            />
            <div
              className="relative z-10 h-[5px] w-[5px] rounded-full"
              style={{ backgroundColor: 'rgba(160,140,110,0.20)', boxShadow: '0 0 6px rgba(160,140,110,0.1)' }}
            />
          </div>

          {/* ── Two-column chapter list ── */}
          <div className="flex gap-12 sm:gap-14">
            {COLS.map((col, ci) => (
              <div key={ci} className="flex-1 min-w-0">
                {col.map((ch, i) => {
                  const globalIdx = ci * 5 + i
                  return (
                    <button
                      key={ch.numeral}
                      onClick={() => handleClick(ch.to)}
                      className="group relative flex w-full items-start gap-3 py-[7px] text-left transition-[color,background] duration-[600ms] ease-out hover:bg-[rgba(160,140,110,0.035)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[rgba(160,140,110,0.25)]"
                      style={{
                        animation: 'none',
                        animationDelay: `${1.5 + globalIdx * 0.08}s`,
                      }}
                    >
                      {/* Accent marker (appears on hover) */}
                      <div
                        className="absolute bottom-1 left-0 top-1 w-[1px] transition-[opacity,background] duration-[600ms] ease-out opacity-0 group-hover:opacity-100"
                        style={{
                          background: 'linear-gradient(180deg, rgba(160,140,110,0.35), rgba(160,140,110,0.08))',
                        }}
                      />

                      {/* Numeral */}
                      <span
                        className="mt-[2px] min-w-[22px] text-right font-serif text-sm leading-snug transition-[color] duration-[600ms] ease-out sm:text-[15px]"
                        style={{ color: 'rgba(160,140,110,0.40)' }}
                      >
                        {ch.numeral}.
                      </span>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <span
                          className="block font-serif text-sm font-bold leading-snug tracking-[0.04em] transition-[color] duration-[600ms] ease-out sm:text-[15px]"
                          style={{ color: '#5a4a3a' }}
                        >
                          {ch.title}
                        </span>
                        <p
                          className="mt-[3px] font-serif text-xs leading-relaxed transition-[color] duration-[600ms] ease-out sm:text-[13px]"
                          style={{ color: '#8a7a6a' }}
                        >
                          {ch.description}
                        </p>
                      </div>

                      {/* Folio annotation */}
                      <span
                        className="hidden self-start pt-[3px] font-mono text-[9px] uppercase tracking-[0.04em] transition-[color] duration-[600ms] ease-out sm:inline"
                        style={{ color: 'rgba(160,140,110,0.20)' }}
                      >
                        {ch.annotation}
                      </span>
                    </button>
                  )
                })}

                {/* Section end rule */}
                <div
                  className="mt-1 h-[0.5px] w-3/4"
                  style={{
                    background: 'linear-gradient(90deg, rgba(160,140,110,0.10), transparent)',
                    marginLeft: '22px',
                  }}
                />
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div className="mt-10 text-center sm:mt-12">
            <div
              className="h-[0.5px] w-full"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(160,140,110,0.15), transparent)' }}
            />
            <p
              className="mt-5 font-serif text-[10px] uppercase tracking-[0.12em] sm:text-[11px]"
              style={{ color: 'rgba(160,140,110,0.30)' }}
            >
              — Archives of the Cosmere —
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
