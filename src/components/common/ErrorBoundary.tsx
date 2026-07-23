import { Component, type ErrorInfo, type ReactNode } from 'react'
import ArchiveError from '@/components/error/ArchiveError'

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
    console.error('[ArchiveError]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return <ArchiveError error={this.state.error} onRetry={() => this.setState({ hasError: false, error: null })} />
    }

    return this.props.children
  }
}
