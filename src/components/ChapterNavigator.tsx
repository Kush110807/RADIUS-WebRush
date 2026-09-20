import { chapters, chapterColors } from '../data/chapters'
import type { ChapterId } from '../types/receipts'

export default function ChapterNavigator({active,onSelect}:{active:ChapterId,onSelect:(id:ChapterId)=>void}){
 return <nav className="chapters" aria-label="Story chapters">
  <p className="eyebrow">Four chapters</p>
  <ol>{chapters.map(ch=><li key={ch.id}>
   <button type="button" onClick={()=>onSelect(ch.id)} aria-current={active===ch.id?'step':undefined} className={`chapter-button ${active===ch.id?'active':''}`}>
    <span className="chapter-index">{ch.number}</span>
    <span className="chapter-copy"><strong>{ch.name}</strong><small>{ch.range}</small><span>{ch.status}</span></span>
    <i style={{background:chapterColors[ch.id]}} aria-hidden="true"/>
   </button>
  </li>)}</ol>
 </nav>
}
