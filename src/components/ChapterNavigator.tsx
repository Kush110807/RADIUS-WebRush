import type { CSSProperties } from 'react'
import { chapters, chapterColors } from '../data/chapters'
import type { ChapterId } from '../types/receipts'

export default function ChapterNavigator({ active, onSelect }: { active: ChapterId; onSelect: (id: ChapterId) => void }) {
  return (
    <nav className="chapters" aria-label="Story chapters">
      <p className="eyebrow">Four chapters</p>
      <ol>
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <button
              type="button"
              onClick={() => onSelect(chapter.id)}
              aria-current={active === chapter.id ? 'step' : undefined}
              className={`chapter-button ${active === chapter.id ? 'active' : ''}`}
              style={{ '--chapter': chapterColors[chapter.id] } as CSSProperties}
            >
              <span className="chapter-index">{chapter.number}</span>
              <span className="chapter-copy">
                <strong>{chapter.name}</strong>
                <small>{chapter.range}</small>
                <span>{chapter.status}</span>
              </span>
              <i style={{ background: chapterColors[chapter.id] }} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
