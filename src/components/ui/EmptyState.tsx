import { memo } from 'react'

interface Props {
  message?: string
}

const EmptyState = memo(function EmptyState({ message = 'No results found.' }: Props) {
  return <p className="py-12 text-center text-sm text-gray-500">{message}</p>
})

export default EmptyState
