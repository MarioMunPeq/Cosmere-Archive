interface Props {
  color: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const SIZE_CLASS = { xs: 'h-1.5 w-1.5', sm: 'h-2 w-2', md: 'h-2.5 w-2.5', lg: 'h-3 w-3' }

export default function ColorDot({ color, size = 'sm' }: Props) {
  return <span className={`${SIZE_CLASS[size]} shrink-0 rounded-full`} style={{ backgroundColor: color }} />
}
