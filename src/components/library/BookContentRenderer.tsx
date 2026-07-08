import type { PageData } from './BookContent'

interface Props {
  page: PageData
  side: 'left' | 'right'
  pageNum?: number
}

const font = "'Cormorant Garamond', 'Playfair Display', 'Georgia', serif"
const ink = '#1a1a2e'

export default function BookContentRenderer({ page, side, pageNum }: Props) {
  return (
    <div
      style={{
        fontFamily: font,
        color: ink,
        width: '100%',
        height: '100%',
        padding: side === 'left' ? '12% 8% 10% 12%' : '12% 12% 10% 8%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Running header */}
      <div
        style={{
          position: 'absolute',
          top: '4%',
          ...(side === 'left' ? { left: '12%' } : { right: '12%' }),
          fontSize: 'clamp(12px, 0.9vw, 14px)',
          letterSpacing: '0.15em',
          color: 'rgba(26,26,46,0.2)',
          fontVariant: 'all-small-caps',
          textTransform: 'lowercase',
        }}
      >
        {side === 'left' ? page.title : page.title}
      </div>

      {/* Thin rule below header */}
      <div
        style={{
          position: 'absolute',
          top: '7%',
          left: '12%',
          right: '12%',
          height: 1,
          background: 'rgba(26,26,46,0.06)',
        }}
      />

      {page.content.map((item, i) => {
        switch (item.type) {
          case 'heading':
            return (
              <h1
                key={i}
                style={{
                  fontFamily: font,
                  fontSize: 'clamp(40px, 3.5vw, 52px)',
                  fontWeight: 600,
                  lineHeight: 1.15,
                  letterSpacing: '0.01em',
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
                  fontFamily: font,
                  fontSize: 'clamp(24px, 2vw, 30px)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  margin: '4% 0 1.5% 0',
                  color: 'rgba(26,26,46,0.3)',
                }}
              >
                {item.value}
              </h2>
            )

          case 'separator':
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  margin: '2% 0',
                }}
              >
                <div style={{ flex: 1, height: 1, background: 'rgba(26,26,46,0.08)' }} />
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'rgba(26,26,46,0.12)',
                  }}
                />
                <div style={{ flex: 1, height: 1, background: 'rgba(26,26,46,0.08)' }} />
              </div>
            )

          case 'dropcap-text':
            return (
              <div key={i} style={{ margin: '2% 0' }}>
                {item.value && (
                  <p style={{ margin: 0 }}>
                    <span
                      style={{
                        fontFamily: font,
                        fontSize: 'clamp(56px, 5vw, 80px)',
                        fontWeight: 600,
                        lineHeight: 0.8,
                        float: 'left',
                        marginRight: '0.12em',
                        marginTop: '0.04em',
                        marginBottom: '-0.08em',
                        color: '#16162a',
                      }}
                    >
                      {item.value[0]}
                    </span>
                    <span
                      style={{
                        fontFamily: font,
                        fontSize: 'clamp(18px, 1.2vw, 20px)',
                        lineHeight: 1.65,
                        color: 'rgba(26,26,46,0.72)',
                        textAlign: 'justify',
                        hyphens: 'auto',
                        WebkitHyphens: 'auto',
                      }}
                    >
                      {item.value.slice(1)}
                    </span>
                  </p>
                )}
              </div>
            )

          case 'text':
            return (
              <p
                key={i}
                style={{
                  fontFamily: font,
                  fontSize: 'clamp(18px, 1.2vw, 20px)',
                  lineHeight: 1.65,
                  color: 'rgba(26,26,46,0.72)',
                  textAlign: 'justify',
                  margin: '1.5% 0',
                  hyphens: 'auto',
                  WebkitHyphens: 'auto',
                  wordBreak: 'break-word',
                }}
              >
                {item.value}
              </p>
            )

          case 'grid':
            return (
              <div
                key={i}
                style={{
                  columnCount: 2,
                  columnGap: '5%',
                  marginTop: '1%',
                  flex: 1,
                  overflowY: 'auto',
                }}
              >
                {item.entries?.map((e, j) => (
                  <div
                    key={j}
                    style={{
                      breakInside: 'avoid',
                      marginBottom: '4%',
                      padding: '2% 3%',
                      background: 'rgba(26,26,46,0.02)',
                      borderRadius: 4,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 'clamp(18px, 1.1vw, 20px)',
                        fontWeight: 600,
                        color: '#16162a',
                        lineHeight: 1.35,
                        marginBottom: '1%',
                      }}
                    >
                      {e.label}
                    </div>
                    {e.value && (
                      <div
                        style={{
                          fontFamily: font,
                          fontSize: 'clamp(16px, 0.95vw, 18px)',
                          color: 'rgba(26,26,46,0.55)',
                          lineHeight: 1.5,
                        }}
                      >
                        {e.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )

          case 'entry':
            return (
              <div key={i} style={{ marginTop: '1.5%' }}>
                {item.entries?.map((e, j) => (
                  <div key={j} style={{ marginBottom: '2%' }}>
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 'clamp(18px, 1.1vw, 20px)',
                        fontWeight: 600,
                        color: '#16162a',
                        lineHeight: 1.35,
                      }}
                    >
                      {e.label}
                    </div>
                    {e.value && (
                      <div
                        style={{
                          fontFamily: font,
                          fontSize: 'clamp(17px, 1vw, 19px)',
                          color: 'rgba(26,26,46,0.55)',
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
              <div key={i} style={{ marginTop: '1.5%' }}>
                {item.items?.map((text, j) => (
                  <div
                    key={j}
                    style={{
                      fontFamily: font,
                      fontSize: 'clamp(17px, 1vw, 19px)',
                      color: 'rgba(26,26,46,0.55)',
                      lineHeight: 1.55,
                      paddingLeft: '4%',
                      position: 'relative',
                      marginBottom: '0.5%',
                    }}
                  >
                    <span style={{ position: 'absolute', left: '0.5%' }}>•</span>
                    {text}
                  </div>
                ))}
              </div>
            )

          default:
            return null
        }
      })}

      {/* Page number */}
      {pageNum !== undefined && (
        <div
          style={{
            position: 'absolute',
            bottom: '4%',
            ...(side === 'left' ? { left: '12%' } : { right: '12%' }),
            fontFamily: font,
            fontSize: 'clamp(12px, 0.9vw, 14px)',
            color: 'rgba(26,26,46,0.2)',
            fontVariant: 'all-small-caps',
            letterSpacing: '0.08em',
          }}
        >
          {pageNum}
        </div>
      )}
    </div>
  )
}
