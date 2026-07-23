import { useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { detectErrorType, getErrorContent, type ArchiveErrorType } from './ErrorContent'
import DestroyedManuscript from './DestroyedManuscript'
import ArchiveParticles from './ArchiveParticles'
import ArchiveButton from './ArchiveButton'
import ErrorDetails from './ErrorDetails'

interface Props {
  error?: unknown
  /** Override auto-detected error type. */
  type?: ArchiveErrorType
  /** Callback for the "Restore Record" button. If omitted, uses window.location.reload. */
  onRetry?: () => void
  /** The route that was being loaded when the error occurred. */
  route?: string
}

export default function ArchiveError({ error, type, onRetry, route }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  const errorType = type ?? detectErrorType(error)
  const content = getErrorContent(errorType)

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }, [onRetry])

  const handleReturn = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }, [navigate])

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{
        background: `
          radial-gradient(ellipse 70% 60% at 50% 40%, transparent 0%, rgba(0,0,0,0.12) 100%),
          #dad2c4
        `,
      }}
    >
      {/* Floating dust particles */}
      <ArchiveParticles />

      {/* Book spread */}
      <div
        className="flex min-h-0 flex-1 flex-col md:flex-row"
        style={{
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
          padding: 'clamp(16px, 3vh, 40px) clamp(12px, 3vw, 40px)',
          gap: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ═══ LEFT PAGE — Error Information ═══ */}
        <div
          className="flex flex-1 flex-col justify-center"
          style={{
            padding: 'clamp(24px, 4vh, 56px) clamp(20px, 3vw, 48px)',
            borderRight: '1px solid rgba(120,100,70,0.1)',
            position: 'relative',
          }}
        >
          {/* Spine shadow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 20,
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.04))',
              pointerEvents: 'none',
            }}
          />

          {/* Title */}
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(28px, 3.5vw, 48px)',
              fontWeight: 300,
              letterSpacing: '0.08em',
              lineHeight: 1.1,
              color: '#2d1a0e',
              margin: '0 0 20px',
            }}
          >
            {content.title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(14px, 1.2vw, 17px)',
              fontWeight: 400,
              fontStyle: 'italic',
              lineHeight: 1.7,
              color: '#5a4a3a',
              margin: '0 0 24px',
              maxWidth: '90%',
              textIndent: 20,
            }}
          >
            {content.description}
          </p>

          {/* Divider */}
          <div
            style={{
              height: 1,
              margin: '0 0 24px',
              background: 'linear-gradient(90deg, rgba(140,120,80,0.25), rgba(140,120,80,0.08) 60%, transparent)',
            }}
          />

          {/* Archive metadata */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '6px 16px',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(11px, 0.9vw, 13px)',
              color: '#8a7a5a',
              marginBottom: 32,
            }}
          >
            <MetadataRow label="Status" value={content.status} />
            <MetadataRow label="Archive" value={content.archive} />
            <MetadataRow label="Integrity" value={content.integrity} />
            <MetadataRow label="Recovery" value={content.recovery} />
            <MetadataRow label="Classification" value={content.classification} />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <ArchiveButton onClick={handleRetry}>Restore Record</ArchiveButton>
            <ArchiveButton variant="secondary" onClick={handleReturn}>
              Return to Archive
            </ArchiveButton>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <ArchiveButton variant="tertiary">Open Index</ArchiveButton>
            </Link>
          </div>

          {/* Dev-only technical details */}
          <ErrorDetails error={error} route={route ?? location.pathname} />
        </div>

        {/* ═══ RIGHT PAGE — Destroyed Manuscript ═══ */}
        <div
          className="flex flex-1"
          style={{
            padding: 'clamp(16px, 3vh, 40px) clamp(12px, 2vw, 32px)',
            position: 'relative',
          }}
        >
          <DestroyedManuscript inscription={content.inscription} />
        </div>
      </div>
    </div>
  )
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span
        style={{
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontSize: 'clamp(10px, 0.75vw, 11px)',
        }}
      >
        {label}
      </span>
      <span style={{ fontStyle: 'italic' }}>{value}</span>
    </>
  )
}
