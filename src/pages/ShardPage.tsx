import { Link, useParams } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import { getShardById, getBooksWithShard, getMagicSystemsWithShard, getPlanetsWithShard } from '@/data/static/shards'

export default function ShardPage() {
  const { shardId } = useParams<{ shardId: string }>()
  const shard = shardId ? getShardById(shardId) : undefined
  const planets = shardId ? getPlanetsWithShard(shardId) : []
  const magic = shardId ? getMagicSystemsWithShard(shardId) : []
  const books = shardId ? getBooksWithShard(shardId) : []

  useSEOMeta({
    title: shard ? `${shard.name} — Shard — Cosmere Archive` : 'Shard — Cosmere Archive',
    description: shard?.summary ?? 'Shard of Adonalsium in the Cosmere.',
  })

  if (!shard) {
    return (
      <div className="min-h-[calc(100dvh-var(--nav-h,56px))] bg-[#0a0a0f] px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-serif text-3xl text-slate-100">Unknown shard</h1>
          <p className="mt-3 text-slate-400">No record exists for {shardId ?? 'this id'}.</p>
          <Link to="/celestial-charts" className="mt-6 inline-block text-cyan-400 hover:text-cyan-300">
            Return to Celestial Charts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100dvh-var(--nav-h,56px))] bg-[#0a0a0f] text-slate-200">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/celestial-charts" className="text-sm text-cyan-400 hover:text-cyan-300">
            ← Celestial Charts
          </Link>
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-slate-500">Records · Shard</span>
        </div>
        <header className="mb-10">
          <h1 className="font-serif text-5xl tracking-tight text-slate-100">{shard.name}</h1>
          {shard.summary && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">{shard.summary}</p>}
        </header>
        <section className="mb-8">
          <h2 className="mb-3 font-serif text-xl text-slate-100">Planets</h2>
          <div className="flex flex-wrap gap-2">
            {planets.length === 0 && <span className="text-slate-500">No linked planets.</span>}
            {planets.map((p) => (
              <Link
                key={p.id}
                to={`/celestial-charts?planet=${p.id}`}
                className="border border-slate-700 px-3 py-1 hover:border-cyan-500/60"
              >
                {p.name}
              </Link>
            ))}
          </div>
        </section>
        <section className="mb-8">
          <h2 className="mb-3 font-serif text-xl text-slate-100">Magic Systems</h2>
          <div className="flex flex-wrap gap-2">
            {magic.length === 0 && <span className="text-slate-500">No linked systems.</span>}
            {magic.map((m) => (
              <Link
                key={m.id}
                to={`/magic?system=${m.id}`}
                className="border border-slate-700 px-3 py-1 hover:border-cyan-500/60"
              >
                {m.name}
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 font-serif text-xl text-slate-100">Books</h2>
          <div className="flex flex-wrap gap-2">
            {books.length === 0 && <span className="text-slate-500">No linked books.</span>}
            {books.map((b) => (
              <Link
                key={b.id}
                to={`/library?book=${b.id}`}
                className="border border-slate-700 px-3 py-1 hover:border-cyan-500/60"
              >
                {b.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
