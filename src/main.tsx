import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled app error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0e0d22] text-[#f2f0ff]">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#15132f] border border-white/10 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-4 text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold mb-2">Terjadi Kesalahan Ringan</h2>
            <p className="text-xs text-[#a7a3c9] mb-5 leading-relaxed">
              Aplikasi mengalami kendala sementara saat memuat data. Tekan tombol di bawah untuk memuat ulang.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] shadow-lg shadow-[#7c6cf5]/30 active:scale-95 transition-transform"
            >
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

