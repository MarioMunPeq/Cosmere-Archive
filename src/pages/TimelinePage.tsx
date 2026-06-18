import Timeline from '@/components/timeline/Timeline'

export default function TimelinePage() {
  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-purple-300">
          Línea Temporal
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Explora los eventos del Cosmere en orden cronológico. Filtra por saga, tipo o año.
        </p>
      </div>

      <Timeline />
    </section>
  )
}
