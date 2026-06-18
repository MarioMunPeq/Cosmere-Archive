import { useParams } from 'react-router-dom'

// CharacterDetail — individual character page.
// useParams reads the ":id" from the URL (e.g. /characters/kaladin).
export default function CharacterDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <section>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-purple-300">
        {id ?? 'Personaje desconocido'}
      </h1>
      <div className="rounded-lg border border-purple-900/30 bg-gray-900/50 p-8 text-center">
        <p className="text-gray-400">🔒 Detalle del personaje (próximamente).</p>
      </div>
    </section>
  )
}
