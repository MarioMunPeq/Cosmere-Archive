// Dashboard — the home page. For now it's a placeholder.
// In later sessions we'll add: books read, progress %, unlocked characters, etc.
export default function Dashboard() {
  return (
    <section>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-purple-300">
        Cosmere Archive
      </h1>
      <p className="mb-8 text-gray-500">
        Tu guía interactiva del universo de Brandon Sanderson, libre de spoilers.
      </p>

      <div className="rounded-lg border border-purple-900/30 bg-gray-900/50 p-8 text-center">
        <p className="text-gray-400">
          📊 El dashboard mostrará tu progreso de lectura aquí.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Marca libros como leídos en la sección Libros y el contenido se adaptará.
        </p>
      </div>
    </section>
  )
}
