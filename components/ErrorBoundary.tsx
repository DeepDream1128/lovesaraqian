import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen w-full bg-[#010806] text-red-500 font-sans p-8 text-center">
          <div>
            <h2 className="text-2xl font-serif mb-4 text-yellow-500">Something went wrong</h2>
            <p className="text-sm opacity-70 bg-black/50 p-4 rounded border border-red-900/30">
              {this.state.error?.message || "Unknown error occurred"}
            </p>
            <button 
              className="mt-6 px-6 py-2 border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 transition"
              onClick={() => window.location.reload()}
            >
              Reload Experience
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;