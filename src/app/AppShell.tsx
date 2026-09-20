import type { ReactNode } from 'react'
import { Database, Info, Search } from 'lucide-react'
import type { AppView } from './useHashView'

export default function AppShell({
  view,
  onNavigate,
  children,
}: {
  view: AppView
  onNavigate: (view: AppView) => void
  children: ReactNode
}) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="topbar">
        <button className="wordmark" type="button" onClick={() => onNavigate('landing')} aria-label="RADIUS home">
          RADIUS<span aria-hidden="true">●</span>
        </button>
        <div className="top-actions">
          <span className="source-pill"><Database size={13} aria-hidden="true" />College Experience Study · static archive</span>
          {view === 'story' && (
            <>
              <button type="button" onClick={() => onNavigate('archive')} aria-label="Open receipt archive"><Search size={15} aria-hidden="true" /><span>Archive</span></button>
              <button type="button" onClick={() => onNavigate('methodology')} aria-label="Open methodology"><Info size={15} aria-hidden="true" /><span>Method</span></button>
            </>
          )}
        </div>
      </header>
      {children}
    </div>
  )
}
