import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Database, BookOpen, Search, Info } from 'lucide-react'
import rawData from './data/anonymous37.json'
import type { ChapterId, DataPayload, ThreadId } from './types/receipts'
import { chapters, chapterColors } from './data/chapters'
import { fmtDate } from './lib/formatters'
import LivingRadius from './components/LivingRadius'
import ChapterNavigator from './components/ChapterNavigator'
import TimeScrubber from './components/TimeScrubber'
import ThreadSelector from './components/ThreadSelector'
import CurrentObservation from './components/CurrentObservation'
import EvidenceDrawer from './components/EvidenceDrawer'
import { useTimeline } from './hooks/useTimeline'
import { useReducedMotion } from './hooks/useReducedMotion'

const ArchiveExplorer=lazy(()=>import('./components/ArchiveExplorer'))
const Methodology=lazy(()=>import('./components/Methodology'))
const data=rawData as unknown as DataPayload

type View='landing'|'story'|'archive'|'methodology'

export default function App(){
 const [view,setView]=useState<View>('landing'); const [index,setIndex]=useState(0); const [thread,setThread]=useState<ThreadId>('movement'); const [evidence,setEvidence]=useState(false); const reduce=useReducedMotion()
 const {current,previous}=useTimeline(data.records,index)
 const [announcement,setAnnouncement]=useState('')
 useEffect(()=>{
  const timer=window.setTimeout(()=>setAnnouncement(`Selected ${fmtDate(current.date)}, ${current.chapter} chapter, radius score ${current.radiusScore??'unavailable'}.`),180)
  return()=>window.clearTimeout(timer)
 },[current.date,current.chapter,current.radiusScore])
 const currentChapter=current?.chapter??'before'
 const chapterStart=useMemo(()=>Object.fromEntries(chapters.map(c=>[c.id,data.records.findIndex(r=>r.chapter===c.id)])) as Record<ChapterId,number>,[])
 const goChapter=(id:ChapterId)=>{const i=chapterStart[id]; if(i>=0)setIndex(i)}
 if(view==='archive') return <Suspense fallback={<div className="loading">Opening archive…</div>}><ArchiveExplorer data={data} onBack={()=>setView('story')}/></Suspense>
 if(view==='methodology') return <Suspense fallback={<div className="loading">Opening notes…</div>}><Methodology data={data} onBack={()=>setView('story')}/></Suspense>
 return <div className="app-shell">
   <a className="skip-link" href="#main-content">Skip to main content</a>
   <header className="topbar"><button className="wordmark" onClick={()=>setView('landing')} aria-label="RADIUS home">RADIUS<span aria-hidden="true">●</span></button><div className="top-actions"><span className="source-pill"><Database size={13}/>College Experience Study · static archive</span>{view==='story'&&<><button onClick={()=>setView('archive')}><Search size={15}/>Archive</button><button onClick={()=>setView('methodology')}><Info size={15}/>Method</button></>}</div></header>
   <AnimatePresence>
   {view==='landing'?<motion.main id="main-content" className="landing" key="landing" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,scale:reduce?1:.98}}>
      <section className="hero-copy"><p className="eyebrow">Your life, in receipts · Anonymous 37</p><h1>How far can<br/>a life <em>shrink?</em></h1><p className="hero-tagline">The year a life folded inward.</p><p className="hero-support">Four years. 1,227 days. One anonymous student. Thousands of digital traces.</p><button className="primary-cta" onClick={()=>{setIndex(0);setView('story')}}>Enter the archive <ArrowRight/></button><span className="quiet-instruction">Drag through four years of digital traces</span></section>
      <motion.section layoutId={reduce?undefined:"radius-frame"} className="hero-visual" aria-label="Preview of the living radius"><div className="hero-orbit outer"/><div className="hero-orbit inner"/><motion.div className="hero-radius" layoutId="living-radius" animate={reduce?{scale:1}:{scale:[.72,1,.72]}} transition={reduce?{duration:0}:{duration:7,repeat:Infinity,ease:'easeInOut'}}><span>R</span></motion.div><div className="hero-caption"><b>2018 — 2022</b><span>physical world / recorded daily</span></div></motion.section>
      <footer className="landing-footer"><span>Observed change, not causal diagnosis.</span><span>Scroll-free guided experience ↓</span></footer>
    </motion.main>:
    <motion.main id="main-content" className="story" key="story" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <div className="story-grid">
       <ChapterNavigator active={currentChapter} onSelect={goChapter}/>
       <motion.section layoutId={reduce?undefined:"radius-frame"} className="visual-stage" aria-label="Living radius story visual"><div className="visual-heading"><div><p className="eyebrow">Living radius · {chapters.find(c=>c.id===currentChapter)?.name}</p><h1>{fmtDate(current.date)}</h1></div><span style={{borderColor:chapterColors[currentChapter]}}>{current.radiusScore==null?'No radius':`${Math.round(current.radiusScore)} / 100`}</span></div><LivingRadius receipt={current} trail={previous} thread={thread} baselineScore={data.normalisation.baselineRadiusScore}/><ThreadSelector value={thread} onChange={setThread}/></motion.section>
       <CurrentObservation receipt={current} thread={thread} data={data} onEvidence={()=>setEvidence(true)}/>
      </div>
      <TimeScrubber records={data.records} index={index} onChange={setIndex}/>
      <nav className="story-footer" aria-label="Secondary navigation"><button onClick={()=>setView('archive')}><BookOpen size={16}/>Explore all receipts</button><span>{data.range.start} → {data.range.end}</span><button onClick={()=>setView('methodology')}>How the radius works</button></nav>
      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      <EvidenceDrawer open={evidence} onClose={()=>setEvidence(false)} receipt={current} thread={thread} data={data}/>
    </motion.main>}
   </AnimatePresence>
 </div>
}
