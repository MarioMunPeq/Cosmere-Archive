import { useFontSize, type FontSize } from '@/hooks/useFontSize'

const LABELS: Record<FontSize, string> = {
  small: 'S',
  medium: 'M',
  large: 'L',
}

export default function FontSizeControls() {
  const { size, cycleSize } = useFontSize()

  return (
    <button
      onClick={cycleSize}
      aria-label={`Font size: ${size}. Click to change.`}
      className="rounded px-2 py-1 text-xs font-bold tracking-wider text-gray-500 transition-colors hover:text-gray-300"
    >
      {LABELS[size]}
    </button>
  )
}
