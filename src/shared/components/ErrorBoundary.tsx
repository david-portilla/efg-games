'use client';

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode | ((error: Error) => ReactNode);
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Class-based error boundary — catches render errors in its subtree.
 * Accepts a static ReactNode or a render-prop for error-aware fallbacks.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Future: send to error reporting service (Sentry, Datadog, etc.)
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { fallback, children } = this.props;

    if (error) {
      return typeof fallback === 'function' ? fallback(error) : fallback;
    }

    return children;
  }
}
