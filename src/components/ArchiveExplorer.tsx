import { useState, type ChangeEvent, type CSSProperties } from 'react'
import { Search, X, Inbox } from 'lucide-react'
import type { ChapterId, DataPayload, LifeReceipt, ThreadId } from '../types/receipts'
import { chapters } from '../data/chapters'
import { threads, metricSpecs } from '../lib/metrics'
import { useReceiptSearch } from '../hooks/useReceiptSearch'
import { fmtDate } from '../lib/formatters'
import EvidenceDrawer from './EvidenceDrawer'

export default function ArchiveExplorer({data,onBack}:{data:DataPayload,onBack:()=>void}){
 const [query,setQuery]=useState(''); const [chapter,setChapter]=useState<ChapterId|'all'>('all'); const [thread,setThread]=useState<ThreadId|'all'>('all'); const [sort,setSort]=useState<'date-desc'|'date-asc'|'unusual'>('date-desc'); const [selected,setSelected]=useState<LifeReceipt|null>(null)
 const results=useReceiptSearch(data.records,query,chapter,thread,sort,data.chapterMedians.before)
 const visible=results.slice(0,180); const activeThread:ThreadId=thread==='all'?'movement':thread
 return <main className="archive-view">
  <header className="archive-header"><div><button className="text-button" onClick={onBack}>← Story mode</button><p className="eyebrow">Anonymous 37 · evidence archive</p><h1>Browse the receipts.</h1><p>Search and inspect the daily records behind the story. No raw contact identifiers, coordinates, or message contents are exposed.</p></div><span className="archive-count" aria-live="polite">{results.length.toLocaleString()} days</span></header>
  <section className="archive-controls" aria-label="Archive filters">
   <label className="search-box"><Search size={18}/><span className="sr-only">Search receipts</span><input value={query} onChange={(e:ChangeEvent<HTMLInputElement>)=>setQuery(e.target.value)} placeholder="Search date, year, chapter or metric…"/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear search"><X size={16}/></button>}</label>
   <div className="archive-thread-row" aria-label="Filter by evidence thread">
    <button className={thread==='all'?'active':''} onClick={()=>setThread('all')}>All threads</button>
    {threads.map(t=>{const Icon=t.icon;return <button key={t.id} className={thread===t.id?'active':''} onClick={()=>setThread(t.id)} style={{'--thread':t.color} as CSSProperties}><Icon size={15}/>{t.label}</button>})}
   </div>
   <div className="filter-row"><label><span>Chapter</span><select value={chapter} onChange={(e:ChangeEvent<HTMLSelectElement>)=>setChapter(e.target.value as ChapterId|'all')}><option value="all">All chapters</option>{chapters.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
   <label><span>Sort</span><select value={sort} onChange={(e:ChangeEvent<HTMLSelectElement>)=>setSort(e.target.value as typeof sort)}><option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="unusual">Largest change</option></select></label></div>
  </section>
  {visible.length===0?<section className="empty-state"><Inbox/><h2>No receipts found</h2><p>Try a broader date, chapter, or evidence thread.</p><button onClick={()=>{setQuery('');setChapter('all');setThread('all')}}>Clear filters</button></section>:
  <section className="archive-grid" aria-label="Receipt results">{visible.map(r=><button className="archive-card" key={r.date} onClick={()=>setSelected(r)}>
    <div className="archive-card-head"><span>{fmtDate(r.date,false)}</span><span>{chapters.find(c=>c.id===r.chapter)?.name}</span></div>
    <div className="archive-radius"><i style={{width:`${Math.max(8,r.radiusScore??0)}%`}}/><b>{r.radiusScore==null?'—':Math.round(r.radiusScore)}</b><small>radius</small></div>
    <div className="archive-metrics">{metricSpecs[activeThread].slice(0,3).map(m=>{const raw=r[m.key]; const v=typeof raw==='number'?raw:null; return <span key={String(m.key)}><small>{m.label}</small><strong>{v==null?'—':`${v.toFixed(m.digits??0)}${m.unit}`}</strong></span>})}</div>
   </button>)}</section>}
  {results.length>visible.length&&<p className="archive-limit">Showing the first {visible.length} results for performance. Refine your search to inspect a specific period.</p>}
  {selected&&<EvidenceDrawer open={!!selected} onClose={()=>setSelected(null)} receipt={selected} thread={activeThread} data={data}/>} 
 </main>
}
