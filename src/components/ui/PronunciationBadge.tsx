export default function PronunciationBadge({ pronunciation }: { pronunciation: string }) {
  return (
    <span
      className="ml-1.5 inline-flex items-center gap-1 rounded bg-gray-800/60 px-1.5 py-0.5 text-xxs text-gray-500"
      title={`Pronounced: ${pronunciation}`}
    >
      <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
        />
      </svg>
      {pronunciation}
    </span>
  )
}
