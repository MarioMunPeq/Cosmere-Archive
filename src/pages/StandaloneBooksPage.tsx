import BackToMapButton from '@/components/ui/BackToMapButton'
import BooksPage from './BooksPage'

export default function StandaloneBooksPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative px-4 pt-4 sm:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-cyan-900/10 blur-3xl" />
          <div className="absolute -right-10 -top-5 h-32 w-32 rounded-full bg-purple-900/10 blur-3xl" />
        </div>
        <BackToMapButton className="relative" />
        <h1 className="relative mt-2 text-2xl font-bold bg-gradient-to-r from-cyan-200 via-purple-200 to-gray-100 bg-clip-text text-transparent">
          Cosmere Books
        </h1>
        <p className="relative mt-1 text-sm text-gray-500">
          All Cosmere books, from Elantris to the latest Secret Projects
        </p>
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <BooksPage />
      </div>
    </div>
  )
}
