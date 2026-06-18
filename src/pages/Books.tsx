// Books — the book library page. Placeholder for now.
// Later: grid of books with covers, read/unread toggle.
export default function Books() {
  return (
    <section>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-purple-300">
        Biblioteca
      </h1>
      <p className="mb-8 text-gray-500">
        Explora los libros del Cosmere y marca los que has leído.
      </p>

      <div className="rounded-lg border border-purple-900/30 bg-gray-900/50 p-8 text-center">
        <p className="text-gray-400">📚 Los libros aparecerán aquí.</p>
      </div>
    </section>
  )
}
