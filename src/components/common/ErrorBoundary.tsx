import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-0 flex-1 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="text-xl font-bold text-red-400">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-500">{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-purple-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
