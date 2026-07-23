import { useState } from 'react'

export default function Signature() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="mt-8 flex flex-col items-end" style={{ minHeight: loaded ? 'auto' : '36px' }}>
      <img
        src={`${import.meta.env.BASE_URL}images/about/signature.png`}
        alt="Signature of Mario Muñoz Pequeño"
        className="w-auto object-contain mb-2"
        style={{
          maxWidth: '220px',
          height: 'auto',
          opacity: loaded ? 0.9 : 0,
          filter: 'sepia(0.3) saturate(0.7) brightness(0.85)',
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
      <span className="font-serif text-[10px] uppercase tracking-[0.1em]" style={{ color: '#7a6040' }}>
        Mario Muñoz Pequeño
      </span>
    </div>
  )
}
