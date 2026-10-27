'use client'
import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ALL_CHARACTERS, BOOKS } from '@/data/static'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import type { HonorbladeData } from '@/types/aharietiam'
import HeraldGlyph from './HeraldGlyph'
import StepBackMark from './StepBackMark'
import { formatQuote } from './quote'

interface Props {
  blade: HonorbladeData
  light: boolean
  reducedMotion: boolean
  onClose: () => void
}

const BOOK_BY_ID = new Map(BOOKS.map((book) => [book.id, book]))
const CHARACTER_BY_ID = new Map(ALL_CHARACTERS.map((character) => [character.id, character]))
const CONNECTION_ALIASES: Record<string, string> = {
  nin: 'Nale',
  taln: 'Talenel (Taln)',
  ash: 'Shalash (Ash)',
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.86' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23g)' opacity='0.55'/%3E%3C/svg%3E\")"

const STATUS: Record<HonorbladeData['status'], { label: string; dark: string; light: string }> = {
  fallen: { label: 'Fallen', dark: '#d6a777', light: '#77492b' },
  standing: { label: 'Standing', dark: '#b4cdaa', light: '#3f6240' },
  missing: { label: 'Missing', dark: '#cbbda7', light: '#5b4c3d' },
}

function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  if (value.length !== 6) return hex
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function titleize(value: string): string {
  return value
    .split('_')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

function connectionName(id: string): string {
  return CONNECTION_ALIASES[id] ?? CHARACTER_BY_ID.get(id)?.name ?? titleize(id)
}

export default function InfoMonolith({ blade, light, reducedMotion, onClose }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const still = reducedMotion || prefersReducedMotion

  const status = STATUS[blade.status]
  const primary = light ? '#2b2118' : '#f2e7d5'
  const secondary = light ? '#544534' : '#cdbca3'
  const muted = light ? '#6b5a47' : '#a99780'
  const rule = light ? 'rgba(74, 56, 40, 0.2)' : 'rgba(206, 174, 132, 0.18)'
  const accent = blade.color
  const nameId = `aharietiam-${blade.id}-name`
  const display = 'var(--font-display)'
  const hand = 'var(--font-hand)'

  const nameSize = light ? 27 : 36
  const titleSize = light ? 16 : 18
  const quoteSize = light ? 19 : 22
  const bodySize = light ? 15.5 : 16

  const kickerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    margin: 0,
    fontFamily: display,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.17em',
    textTransform: 'uppercase',
    color: muted,
  }

  const labelStyle: CSSProperties = {
    margin: 0,
    fontFamily: display,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: muted,
  }

  const quoteStyle: CSSProperties = {
    margin: 0,
    fontFamily: display,
    fontSize: quoteSize,
    fontStyle: 'italic',
    lineHeight: 1.38,
    color: primary,
    textWrap: 'pretty',
  }

  const bodyStyle: CSSProperties = {
    margin: '20px 0 0',
    fontFamily: display,
    fontSize: bodySize,
    lineHeight: 1.68,
    color: primary,
    textWrap: 'pretty',
  }

  const valueStyle: CSSProperties = {
    margin: '4px 0 0',
    fontFamily: display,
    fontSize: light ? 14 : 14.5,
    lineHeight: 1.45,
    color: primary,
  }

  const stillStyle: CSSProperties = {
    fontFamily: hand,
    color: muted,
    letterSpacing: '0.01em',
  }

  const rootStyle: CSSProperties = light
    ? {
        left: 0,
        right: 0,
        bottom: 'var(--bottom-nav-h, 64px)',
        maxHeight: 'min(56vh, 560px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#ece0c8',
        color: primary,
        borderTop: '1px solid rgba(74, 56, 40, 0.55)',
        borderRadius: '3px 3px 0 0',
        boxShadow: '0 -22px 60px rgba(0, 0, 0, 0.58)',
        opacity: 0,
        zIndex: 45,
      }
    : {
        right: 'clamp(16px, 2.4vw, 36px)',
        top: 'calc(var(--nav-h, 56px) + 16px)',
        bottom: 24,
        width: 'clamp(360px, 33vw, 440px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'linear-gradient(158deg, #2c231b 0%, #221a14 48%, #19130f 100%)',
        color: primary,
        border: '1px solid rgba(210, 180, 140, 0.22)',
        borderRadius: 3,
        boxShadow: '0 28px 70px rgba(0, 0, 0, 0.62), inset 0 1px 0 rgba(240, 214, 178, 0.1)',
        opacity: 0,
        zIndex: 30,
      }

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (still) {
      gsap.set(root, { opacity: 1, y: 0 })
      gsap.set(reveals, { opacity: 1, y: 0 })
      return
    }

    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
    timeline.fromTo(root, { opacity: 0, y: light ? 26 : 10 }, { opacity: 1, y: 0, duration: 0.42 })
    timeline.fromTo(reveals, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.48, stagger: 0.055 }, 0.14)

    return () => {
      timeline.kill()
    }
  }, [still, light, blade.id])

  return (
    <aside
      ref={rootRef}
      role="region"
      aria-labelledby={nameId}
      className="pointer-events-auto fixed z-30 flex flex-col"
      style={rootStyle}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: GRAIN,
          backgroundSize: '160px 160px',
          opacity: light ? 0.12 : 0.22,
          mixBlendMode: light ? 'multiply' : 'overlay',
          borderRadius: 'inherit',
        }}
      />

      <header
        style={{
          position: 'relative',
          zIndex: 1,
          flex: '0 0 auto',
          padding: light ? '14px 16px 12px' : '20px 24px 16px',
          borderBottom: `1px solid ${rule}`,
          background: light
            ? 'linear-gradient(180deg, #f2e7d2 0%, #ece0c8 100%)'
            : 'linear-gradient(180deg, rgba(66, 52, 40, 0.5) 0%, rgba(33, 26, 20, 0.05) 100%)',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <p style={kickerStyle}>
            <span
              aria-hidden="true"
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: light ? status.light : status.dark,
                boxShadow: `0 0 0 1px ${withAlpha(light ? status.light : status.dark, 0.35)}`,
                flex: '0 0 auto',
              }}
            />
            {status.label}
            <span aria-hidden="true" style={{ opacity: 0.5 }}>
              ·
            </span>
            {blade.order}
          </p>
          <StepBackMark onClose={onClose} ink={light} label={`Step back from ${blade.name}`} />
        </div>

        <div className="mt-3 flex items-start gap-3">
          <div
            style={{
              width: light ? 42 : 54,
              height: light ? 42 : 54,
              flex: '0 0 auto',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 2,
              border: `1px solid ${light ? 'rgba(74, 56, 40, 0.32)' : 'rgba(214, 184, 144, 0.22)'}`,
              background: light ? 'rgba(74, 56, 40, 0.05)' : 'rgba(0, 0, 0, 0.18)',
              boxShadow: light ? 'inset 0 0 0 3px rgba(236, 224, 200, 0.45)' : 'inset 0 0 0 3px rgba(24, 18, 13, 0.4)',
            }}
          >
            <HeraldGlyph seed={blade.id} color={light ? '#4a3728' : accent} size={light ? 34 : 46} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id={nameId}
              style={{
                margin: '2px 0 0',
                fontFamily: display,
                fontSize: nameSize,
                fontWeight: 500,
                lineHeight: 1.02,
                letterSpacing: '-0.01em',
                color: primary,
              }}
            >
              {blade.name}
            </h2>
            <p
              style={{
                margin: '4px 0 0',
                fontFamily: display,
                fontSize: titleSize,
                fontStyle: 'italic',
                lineHeight: 1.2,
                color: secondary,
              }}
            >
              {blade.title}
            </p>
          </div>
        </div>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: light ? '16px 18px 20px' : '20px 24px 26px',
        }}
      >
        <blockquote
          data-reveal
          style={{
            margin: 0,
            paddingLeft: 15,
            borderLeft: `2px solid ${withAlpha(accent, light ? 0.62 : 0.55)}`,
          }}
        >
          <p style={quoteStyle}>{formatQuote(blade.quote)}</p>
          <footer
            style={{
              ...stillStyle,
              margin: '8px 0 0',
              fontSize: light ? 16 : 15,
              transform: 'rotate(-0.5deg)',
              transformOrigin: 'left center',
            }}
          >
            — recorded at Aharietiam
          </footer>
        </blockquote>

        <p data-reveal style={bodyStyle}>
          {blade.description}
        </p>

        <section
          data-reveal
          aria-label="Herald attributes"
          style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${rule}` }}
        >
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px 18px',
              margin: 0,
            }}
          >
            <div>
              <dt style={labelStyle}>Surges</dt>
              <dd style={valueStyle}>{blade.surges.join(' · ')}</dd>
            </div>
            <div>
              <dt style={labelStyle}>Attributes</dt>
              <dd style={valueStyle}>{blade.attributes.join(' · ')}</dd>
            </div>
            <div>
              <dt style={labelStyle}>Essence</dt>
              <dd style={valueStyle}>{blade.essence}</dd>
            </div>
            <div>
              <dt style={labelStyle}>Soulcasting</dt>
              <dd style={valueStyle}>{blade.soulcasting}</dd>
            </div>
          </dl>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${rule}` }}>
            <dt style={labelStyle}>Honorblade</dt>
            <dd style={{ ...valueStyle, marginTop: 5 }}>{blade.honorbladeGrants}</dd>
          </div>
        </section>

        <section
          data-reveal
          aria-label="Books that record this Herald"
          style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${rule}` }}
        >
          <h3 style={{ ...labelStyle, margin: '0 0 10px' }}>Recorded in</h3>
          <div className="flex flex-wrap gap-2" style={{ margin: 0 }}>
            {blade.books.map((bookId, index) => {
              const book = BOOK_BY_ID.get(bookId)
              const title = book?.title ?? titleize(bookId)
              const tilt = ((index % 3) - 1) * 0.8
              return (
                <span key={bookId} style={{ display: 'inline-block', transform: `rotate(${tilt}deg)` }}>
                  <Link
                    to={`/library?book=${bookId}`}
                    aria-label={`Open ${title} in the library`}
                    className={`inline-flex cursor-pointer items-center gap-2 no-underline transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${
                      light ? 'focus-visible:outline-[#5a3f28]' : 'focus-visible:outline-[#e6bd7e]'
                    }`}
                    style={{
                      minHeight: 30,
                      padding: '5px 9px',
                      borderRadius: 2,
                      border: '1px solid rgba(74, 56, 40, 0.5)',
                      background: light ? 'transparent' : '#e9dcc4',
                      color: '#241c15',
                      boxShadow: light
                        ? 'inset 0 0 0 1px rgba(74, 56, 40, 0.08)'
                        : '0 1px 0 rgba(0, 0, 0, 0.28), inset 0 0 0 1px rgba(255, 255, 255, 0.16)',
                      fontFamily: display,
                      fontSize: 12,
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#8b3a2e',
                        opacity: 0.72,
                        flex: '0 0 auto',
                        boxShadow: '0 0 0 1px rgba(139, 58, 46, 0.28)',
                      }}
                    />
                    <span>{title}</span>
                  </Link>
                </span>
              )
            })}
          </div>
        </section>

        <section
          data-reveal
          aria-label="Connections"
          style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${rule}` }}
        >
          <h3 style={{ ...labelStyle, margin: '0 0 9px' }}>Bound to</h3>
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 14px',
              margin: 0,
              padding: 0,
              listStyle: 'none',
            }}
          >
            {blade.connections.map((connectionId) => (
              <li
                key={connectionId}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: display,
                  fontSize: 13.5,
                  color: secondary,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 3,
                    height: 3,
                    flex: '0 0 auto',
                    background: light ? '#6b5a47' : withAlpha(accent, 0.85),
                    transform: 'rotate(45deg)',
                  }}
                />
                {connectionName(connectionId)}
              </li>
            ))}
          </ul>
        </section>

        {light ? (
          <p
            data-reveal
            style={{
              ...stillStyle,
              margin: '22px 0 0',
              fontSize: 16,
              transform: 'rotate(-0.6deg)',
              transformOrigin: 'left center',
            }}
          >
            Swipe the field to turn the ring.
          </p>
        ) : null}
      </div>
    </aside>
  )
}
