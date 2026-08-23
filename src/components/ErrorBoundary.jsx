import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Fundamental Analyst crashed:', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md text-center card p-8">
            <AlertTriangle className="mx-auto mb-4 text-loss" size={32} />
            <h1 className="font-display text-xl text-paper mb-2">Something went wrong</h1>
            <p className="text-sm text-muted mb-4">
              This page hit an unexpected error while rendering. Your data source or watchlist is unaffected.
            </p>
            <pre className="text-left text-xs text-faint bg-ink-900 border border-line rounded-lg p-3 mb-4 overflow-x-auto whitespace-pre-wrap">
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button onClick={this.handleReset} className="btn-primary text-sm">
              Back to home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
