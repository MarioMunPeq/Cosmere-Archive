import { useCallback, type ComponentProps } from 'react'
import { NavLink } from 'react-router-dom'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'

type Props = ComponentProps<typeof NavLink>

export default function TransitionLink({ onClick, to, ...rest }: Props) {
  const navigate = useViewTransitionNavigate()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
      if (typeof to !== 'string') return
      e.preventDefault()
      navigate(to)
      onClick?.(e)
    },
    [navigate, to, onClick],
  )

  return <NavLink to={to} onClick={handleClick} {...rest} />
}
