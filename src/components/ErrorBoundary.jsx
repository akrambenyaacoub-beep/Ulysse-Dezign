// src/components/ErrorBoundary.jsx
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    console.error('❌ ErrorBoundary getDerivedStateFromError:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary componentDidCatch:', error);
    console.error('Stack trace:', errorInfo?.componentStack || 'No stack trace');
    this.setState({ errorInfo });
    
    // ✅ Empêcher l'erreur de remonter jusqu'à l'écran bleu
    // En production, vous pourriez envoyer à un service comme Sentry
  }

  render() {
    if (this.state.hasError) {
      // ✅ UI de secours propre
      return (
        <div className="fixed bottom-24 right-6 z-[99999] bg-red-500/10 border border-red-500/30 rounded-xl p-4 max-w-sm shadow-2xl">
          <div className="flex items-center gap-2 text-red-400">
            <span className="text-xl">⚠️</span>
            <h3 className="font-semibold">Chat indisponible</h3>
          </div>
          <p className="text-gray-300 text-sm mt-1">
            {this.state.error?.message || 'Une erreur est survenue dans le chat'}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition"
            >
              🔄 Rafraîchir
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-3 py-1.5 bg-[#1A3A6B] hover:bg-[#2A4A6B] text-gray-300 rounded-lg text-sm transition"
            >
              Ignorer
            </button>
          </div>
          {/* ✅ Afficher l'erreur en développement */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-3 text-xs text-gray-400">
              <summary>Détails techniques</summary>
              <pre className="mt-2 p-2 bg-black/30 rounded overflow-auto max-h-32">
                {this.state.error?.stack || 'No stack trace'}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}