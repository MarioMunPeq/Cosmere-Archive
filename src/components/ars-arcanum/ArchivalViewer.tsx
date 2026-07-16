import type { ReactNode } from 'react'

interface Props {
  left: ReactNode
  right: ReactNode
  leftFolio?: string
  rightFolio?: string
  leftHeader?: string
  rightHeader?: string
}

export default function ArchivalViewer({ left, right, leftFolio, rightFolio, leftHeader, rightHeader }: Props) {
  return (
    <div
      className="flex flex-1 w-full h-full items-center justify-center manuscript-focus manuscript-select manuscript-paper manuscript-vignette"
      style={{ padding: 'clamp(20px, 3vh, 48px)' }}
    >
      <div className="flex w-full h-full max-w-[1680px] mx-auto" style={{ perspective: '1800px' }}>
        <div
          className="flex w-full h-full shadow-2xl"
          style={{
            backgroundColor: '#f2ece0',
            transform: 'rotateY(0.3deg)',
            borderRadius: '0 2px 2px 0',
          }}
        >
          {/* Left page */}
          <div className="flex-[1.12] flex flex-col h-full overflow-hidden relative">
            {/* Gutter shadow */}
            <div
              className="absolute right-0 top-0 bottom-0 w-[14px] z-[1] pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(60,45,30,0.015) 30%, rgba(60,45,30,0.03) 60%, rgba(60,45,30,0.02) 100%)',
              }}
            />

            {/* Running header */}
            {leftHeader && (
              <div className="shrink-0 px-14 pt-10 pb-3 flex items-center gap-4">
                <span
                  className="font-serif text-[9px] uppercase tracking-[0.12em]"
                  style={{ color: 'rgba(80,60,40,0.15)' }}
                >
                  {leftHeader}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(80,60,40,0.04)' }} />
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-14 pb-20 pt-4 animate-page-enter manuscript-scrollbar">
              {left}
            </div>
            {leftFolio && (
              <div
                className="absolute bottom-5 left-14 font-serif text-[8px] italic"
                style={{ color: 'rgba(80,60,40,0.12)' }}
              >
                — {leftFolio} —
              </div>
            )}
          </div>

          {/* Physical spine with binding threads */}
          <div className="relative w-[24px] shrink-0 self-stretch flex flex-col" style={{ zIndex: 3 }}>
            {/* Main spine body */}
            <div
              className="flex-1 relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(180deg, rgba(80,60,40,0.06) 0%, rgba(60,45,30,0.10) 15%, rgba(50,35,20,0.14) 50%, rgba(60,45,30,0.10) 85%, rgba(80,60,40,0.06) 100%)',
              }}
            >
              {/* Curvature left edge */}
              <div
                className="absolute inset-y-0 -left-[8px] w-[10px]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(80,60,40,0.03) 60%, rgba(60,45,30,0.06) 100%)',
                }}
              />
              {/* Curvature right edge */}
              <div
                className="absolute inset-y-0 -right-[8px] w-[10px]"
                style={{
                  background:
                    'linear-gradient(270deg, transparent 0%, rgba(80,60,40,0.03) 60%, rgba(60,45,30,0.06) 100%)',
                }}
              />
              {/* Center crease */}
              <div className="absolute inset-y-0 left-1/2 w-px" style={{ background: 'rgba(50,35,20,0.12)' }} />
              {/* Binding threads — horizontal stitches */}
              <div
                className="absolute top-[15%] left-0 right-0 flex items-center justify-center gap-[6px]"
                style={{ transform: 'translateY(-50%)' }}
              >
                <span className="w-[1.5px] h-[5px] rotate-[8deg]" style={{ background: 'rgba(60,45,30,0.12)' }} />
                <span className="w-[1.5px] h-[5px] rotate-[-8deg]" style={{ background: 'rgba(60,45,30,0.08)' }} />
                <span className="w-[1.5px] h-[5px] rotate-[5deg]" style={{ background: 'rgba(60,45,30,0.10)' }} />
              </div>
              <div className="absolute top-[38%] left-0 right-0 h-px" style={{ background: 'rgba(80,60,40,0.04)' }} />
              <div className="absolute top-[62%] left-0 right-0 h-px" style={{ background: 'rgba(80,60,40,0.04)' }} />
              <div
                className="absolute top-[85%] left-0 right-0 flex items-center justify-center gap-[6px]"
                style={{ transform: 'translateY(-50%)' }}
              >
                <span className="w-[1.5px] h-[5px] rotate-[-6deg]" style={{ background: 'rgba(60,45,30,0.10)' }} />
                <span className="w-[1.5px] h-[5px] rotate-[8deg]" style={{ background: 'rgba(60,45,30,0.08)' }} />
                <span className="w-[1.5px] h-[5px] rotate-[-5deg]" style={{ background: 'rgba(60,45,30,0.12)' }} />
              </div>
              {/* Subtle glue line */}
              <div
                className="absolute top-[50%] left-[20%] right-[20%] h-px"
                style={{ background: 'rgba(60,45,30,0.03)' }}
              />
            </div>
          </div>

          {/* Right page */}
          <div className="flex-[0.88] flex flex-col h-full overflow-hidden relative">
            {/* Gutter shadow */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[14px] z-[1] pointer-events-none"
              style={{
                background:
                  'linear-gradient(270deg, transparent 0%, rgba(60,45,30,0.015) 30%, rgba(60,45,30,0.03) 60%, rgba(60,45,30,0.02) 100%)',
              }}
            />

            {/* Running header */}
            {rightHeader && (
              <div className="shrink-0 px-14 pt-10 pb-3 flex items-center gap-4">
                <div className="flex-1 h-px" style={{ background: 'rgba(80,60,40,0.04)' }} />
                <span
                  className="font-serif text-[9px] uppercase tracking-[0.12em]"
                  style={{ color: 'rgba(80,60,40,0.15)' }}
                >
                  {rightHeader}
                </span>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-14 pb-20 pt-4 animate-page-enter manuscript-scrollbar">
              {right}
            </div>
            {rightFolio && (
              <div
                className="absolute bottom-5 right-14 font-serif text-[8px] italic"
                style={{ color: 'rgba(80,60,40,0.12)' }}
              >
                — {rightFolio} —
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
