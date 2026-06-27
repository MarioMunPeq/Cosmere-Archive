import { useCallback } from 'react'
import { useNavigate, type NavigateOptions } from 'react-router-dom'

export function useViewTransitionNavigate() {
  const navigate = useNavigate()

  const navigateWithTransition = useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        navigate(to)
      } else if (document.startViewTransition) {
        document.startViewTransition(() => {
          navigate(to, options)
        })
      } else {
        navigate(to, options)
      }
    },
    [navigate],
  )

  return navigateWithTransition
}
