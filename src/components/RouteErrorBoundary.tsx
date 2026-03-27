import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }

type State = { hasError: boolean }

/**
 * Evita che un errore in una pagina (es. Dashboard) smonti tutta l'app:
 * senza boundary, React può far sparire anche Navbar/Footer.
 */
export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[RouteErrorBoundary]', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-24 text-center">
          <p className="font-serif text-xl text-amber-200/90 mb-2">Qualcosa non ha funzionato in questa pagina</p>
          <p className="text-white/50 text-sm max-w-md mb-6">
            Prova a ricaricare. Se il problema resta, apri il sito da una finestra senza estensioni o contatta il supporto.
          </p>
          <button
            type="button"
            className="btn-gold text-sm px-6 py-2"
            onClick={() => window.location.reload()}
          >
            Ricarica pagina
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
