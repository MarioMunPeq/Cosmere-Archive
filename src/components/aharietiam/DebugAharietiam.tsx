'use client'
import { useEffect, useState } from 'react'
import { HONORBLADES } from '@/data/static/aharietiam'

interface AssetInfo {
  id: string
  name: string
  path: string
  loaded: boolean
  width: number
  height: number
}

const BASE = import.meta.env.BASE_URL

interface Props {
  onClose: () => void
}

export default function DebugAharietiam({ onClose }: Props) {
  const [assets, setAssets] = useState<AssetInfo[]>([])

  useEffect(() => {
    const results: AssetInfo[] = []

    HONORBLADES.sort((a, b) => a.positionIndex - b.positionIndex).forEach((h) => {
      const path = `${BASE}images/aharietam/${h.id}.webp`
      const img = new Image()
      img.onload = () => {
        console.log(`[Aharietiam] Loaded: ${path}`)
        results.push({ id: h.id, name: h.name, path, loaded: true, width: img.naturalWidth, height: img.naturalHeight })
        if (results.length === 10) setAssets([...results])
      }
      img.onerror = () => {
        console.warn(`[Aharietiam] FAILED: ${path}`)
        results.push({ id: h.id, name: h.name, path, loaded: false, width: 0, height: 0 })
        if (results.length === 10) setAssets([...results])
      }
      img.src = path
    })
  }, [])

  const allLoaded = assets.length === 10 && assets.every((a) => a.loaded)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0806',
        color: '#d4c8b0',
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: 12,
      }}
    >
      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,235,210,0.1)',
        }}
      >
        <h1 style={{ fontSize: 18, margin: 0 }}>Aharietiam Debug</h1>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,235,210,0.1)',
            border: '1px solid rgba(255,235,210,0.2)',
            color: '#d4c8b0',
            padding: '4px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          CLOSE
        </button>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 12 }}>
          BASE_URL: <code style={{ color: '#8af' }}>{BASE}</code>
          <br />
          Blade count: <strong>{HONORBLADES.length}</strong> (1 empty — Taln)
          <br />
          PNG status:{' '}
          <span style={{ color: allLoaded ? '#6f6' : '#f66' }}>
            {allLoaded ? 'ALL 10 LOADED' : `${assets.length}/10`}
          </span>
          {!allLoaded && assets.length > 0 && (
            <span style={{ display: 'block', color: '#f66', marginTop: 4 }}>
              Failed:{' '}
              {assets
                .filter((a) => !a.loaded)
                .map((a) => a.id)
                .join(', ') || 'none'}
            </span>
          )}
        </div>

        {/* Asset table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,235,210,0.15)' }}>
              <th style={{ padding: 6, textAlign: 'left' }}>Idx</th>
              <th style={{ padding: 6, textAlign: 'left' }}>ID</th>
              <th style={{ padding: 6, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 6, textAlign: 'left' }}>Path</th>
              <th style={{ padding: 6, textAlign: 'left' }}>OK?</th>
              <th style={{ padding: 6, textAlign: 'left' }}>Size</th>
            </tr>
          </thead>
          <tbody>
            {HONORBLADES.sort((a, b) => a.positionIndex - b.positionIndex).map((h) => {
              const a = assets.find((x) => x.id === h.id)
              return (
                <tr
                  key={h.id}
                  style={{ borderBottom: '1px solid rgba(255,235,210,0.05)', opacity: h.id === 'talenel' ? 0.4 : 1 }}
                >
                  <td style={{ padding: 6 }}>{h.positionIndex}</td>
                  <td style={{ padding: 6 }}>{h.id}</td>
                  <td style={{ padding: 6 }}>{h.name}</td>
                  <td style={{ padding: 6, fontSize: 10, color: 'rgba(255,235,210,0.4)' }}>
                    {h.id === 'talenel' ? '— (empty spot)' : `images/aharietam/${h.id}.webp`}
                  </td>
                  <td style={{ padding: 6, color: a?.loaded ? '#6f6' : '#666' }}>
                    {h.id === 'talenel' ? '—' : a ? (a.loaded ? 'YES' : 'NO') : '...'}
                  </td>
                  <td style={{ padding: 6 }}>
                    {h.id === 'talenel' ? '—' : a?.loaded ? `${a.width}×${a.height}` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Debug grid — raw HTML img display */}
        <h2 style={{ margin: '16px 0', fontSize: 14 }}>Raw PNG Grid</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {assets
            .filter((a) => a.loaded)
            .map((a) => (
              <div key={a.id} style={{ width: 120, textAlign: 'center' }}>
                <div
                  style={{
                    width: 80,
                    height: 200,
                    margin: '0 auto',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,235,210,0.1)',
                    overflow: 'hidden',
                  }}
                >
                  <img src={a.path} alt={a.name} style={{ maxWidth: 80, maxHeight: 200, objectFit: 'contain' }} />
                </div>
                <div style={{ marginTop: 4, fontSize: 10, color: 'rgba(255,235,210,0.5)' }}>
                  {a.id} ({a.width}×{a.height})
                </div>
              </div>
            ))}
        </div>

        {/* Scene info */}
        <h2 style={{ margin: '24px 0 8px', fontSize: 14 }}>Scene Layout</h2>
        <div style={{ lineHeight: 1.6, color: 'rgba(255,235,210,0.6)' }}>
          <div>Camera: FOV 48, position (0, 3.2, 15), target (0, 0, 0)</div>
          <div>Platform: circle r=9 at y=-0.05</div>
          <div>Blade ring: circle r=6.5 at y=2.02</div>
          <div>Blade height: ~4.65 units above ground, 0.03 units embedded</div>
          <div>Total blades: 10 (9 visible + 1 Taln empty)</div>
        </div>
      </div>
    </div>
  )
}
