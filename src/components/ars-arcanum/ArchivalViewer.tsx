import type { ReactNode } from 'react'

interface Props {
  left: ReactNode
  right: ReactNode
}

export default function ArchivalViewer({ left, right }: Props) {
  return (
    <div
      className="flex flex-1 w-full h-full items-center justify-center"
      style={{ padding: 'clamp(16px, 2.5vh, 40px)' }}
    >
      <div className="flex w-full h-full max-w-[1600px] mx-auto">
        <div className="flex w-full h-full" style={{ backgroundColor: '#f2ebe0' }}>
          <div className="flex-[1.1] flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto px-12 pb-12 pt-10">{left}</div>
          </div>
          <div className="w-px shrink-0 self-stretch" style={{ background: 'rgba(80,60,40,0.06)' }} />
          <div className="flex-[0.9] flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto px-12 pb-12 pt-10">{right}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
