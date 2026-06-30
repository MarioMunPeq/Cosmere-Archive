import { memo } from 'react'

interface Props {
  onClick: () => void
}

const Overlay = memo(function Overlay({ onClick }: Props) {
  return <div className="fixed inset-0 bg-black/60" onClick={onClick} />
})

export default Overlay
