import type { PageData } from './BookContent'

interface Props {
  page: PageData
  side: 'left' | 'right'
}

const baseText: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', 'Playfair Display', 'Georgia', serif",
  color: '#1a1a2e',
}

export default function BookContentRenderer({ page, side }: Props) {
  return (
    <div
      style={{
        ...baseText,
        width: '100%',
        height: '100%',
        padding: side === 'left' ? '7% 5% 0 7%' : '7% 7% 0 5%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {page.content.map((item, i) => {
        switch (item.type) {
          case 'heading':
            return (
              <h1
                key={i}
                style={{
                  fontSize: 'clamp(1rem, 2.2vw, 1.8rem)',
                  fontWeight: 600,
                  lineHeight: 1.25,
                  letterSpacing: '0.02em',
                  margin: 0,
                  color: '#16162a',
                }}
              >
                {item.value}
              </h1>
            )

          case 'small-heading':
            return (
              <h2
                key={i}
                style={{
                  fontSize: 'clamp(0.55rem, 0.85vw, 0.7rem)',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  margin: '5% 0 2% 0',
                  color: 'rgba(26,26,46,0.35)',
                }}
              >
                {item.value}
              </h2>
            )

          case 'separator':
            return (
              <hr
                key={i}
                style={{
                  width: '25%',
                  margin: '3% 0',
                  border: 'none',
                  height: 1,
                  background: 'rgba(26,26,46,0.08)',
                }}
              />
            )

          case 'text':
            return (
              <p
                key={i}
                style={{
                  fontSize: 'clamp(0.5rem, 0.85vw, 0.72rem)',
                  lineHeight: 1.7,
                  color: 'rgba(26,26,46,0.7)',
                  textAlign: 'justify',
                  margin: '2% 0',
                  hyphens: 'auto',
                  WebkitHyphens: 'auto',
                  wordBreak: 'break-word',
                }}
              >
                {item.value}
              </p>
            )

          case 'entry':
            return (
              <div key={i} style={{ marginTop: '2.5%' }}>
                {item.entries?.map((e, j) => (
                  <div key={j} style={{ marginBottom: '2%' }}>
                    <div
                      style={{
                        fontSize: 'clamp(0.5rem, 0.8vw, 0.68rem)',
                        fontWeight: 600,
                        color: '#16162a',
                        lineHeight: 1.4,
                      }}
                    >
                      {e.label}
                    </div>
                    {e.value && (
                      <div
                        style={{
                          fontSize: 'clamp(0.48rem, 0.75vw, 0.64rem)',
                          color: 'rgba(26,26,46,0.6)',
                          lineHeight: 1.5,
                          marginTop: '0.5%',
                        }}
                      >
                        {e.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )

          case 'list':
            return (
              <div key={i} style={{ marginTop: '2%' }}>
                {item.items?.map((text, j) => (
                  <div
                    key={j}
                    style={{
                      fontSize: 'clamp(0.48rem, 0.75vw, 0.64rem)',
                      color: 'rgba(26,26,46,0.6)',
                      lineHeight: 1.6,
                      paddingLeft: '5%',
                      position: 'relative',
                    }}
                  >
                    <span style={{ position: 'absolute', left: '1%' }}>•</span>
                    {text}
                  </div>
                ))}
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
