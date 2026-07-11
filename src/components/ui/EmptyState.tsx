import { memo } from 'react'

interface Props {
  message?: string
}

const EmptyState = memo(function EmptyState({ message = 'No results found.' }: Props) {
  return (
    <p className="py-8 text-center text-sm" style={{ color: '#8a7a6a' }}>
      {message}
    </p>
  )
})

export default EmptyState
