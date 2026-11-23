import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleResetOffline = () => {
    try {
      localStorage.setItem('estateflow_offline_active', 'true');
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-zinc-200">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4 border border-zinc-200">
            <AlertTriangle className="w-6 h-6 text-zinc-950" />
          </div>
          <h2 className="text-base font-bold text-zinc-950">Something went wrong in this module</h2>
          <p className="text-xs text-zinc-500 mt-1 max-w-md">
            An unexpected error occurred while rendering this section. You can refresh or switch to standalone offline mode to continue using the app seamlessly.
          </p>
          {this.state.error && (
            <pre className="mt-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] text-zinc-600 max-w-md overflow-x-auto text-left">
              {this.state.error.toString()}
            </pre>
          )}
          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              onClick={this.handleReload}
            >
              Reload View
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={this.handleResetOffline}
              className="bg-zinc-950 text-white hover:bg-zinc-800"
            >
              Continue in Offline Engine
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
