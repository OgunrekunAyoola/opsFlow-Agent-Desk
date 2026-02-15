import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-page flex items-center justify-center p-6">
          <div className="max-w-lg w-full glass-panel rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-text-muted mb-6">
              An unexpected error occurred while rendering this screen. You can try again or reload
              the app.
            </p>
            {this.state.error && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl p-3 mb-6 text-left overflow-auto max-h-40">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full sm:w-auto h-10 px-4 rounded-xl bg-grad-main text-white font-medium shadow-md hover:shadow-lg transition-shadow"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto h-10 px-4 rounded-xl border border-slate-200 text-text-primary bg-white hover:bg-slate-50 transition-colors text-sm"
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
