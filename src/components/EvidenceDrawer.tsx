import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import type { DataPayload, LifeReceipt, ThreadId } from '../types/receipts'
import { metricSpecs, threads } from '../lib/metrics'
import { fmtDate, pctText, signedPct } from '../lib/formatters'
import { chapters } from '../data/chapters'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function EvidenceDrawer({open,onClose,receipt,thread,data}:{open:boolean,onClose:()=>void,receipt:LifeReceipt,thread:ThreadId,data:DataPayload}){
 const closeRef=useRef<HTMLButtonElement|null>(null); const panelRef=useRef<HTMLElement|null>(null); const restoreRef=useRef<HTMLElement|null>(null); const reduce=useReducedMotion(); const [mobile,setMobile]=useState(()=>typeof window!=='undefined'&&matchMedia('(max-width: 650px)').matches)
 useEffect(()=>{ const q=matchMedia('(max-width: 650px)'); const sync=()=>setMobile(q.matches); sync(); q.addEventListener('change',sync); return()=>q.removeEventListener('change',sync)},[])
 useEffect(()=>{
  if(!open) return
  restoreRef.current=document.activeElement as HTMLElement
  const oldOverflow=document.body.style.overflow; document.body.style.overflow='hidden'
  requestAnimationFrame(()=>closeRef.current?.focus())
  const handle=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){onClose(); return}
   if(e.key!=='Tab'||!panelRef.current) return
   const focusables=[...panelRef.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hasAttribute('disabled'))
   if(!focusables.length) return
   const first=focusables[0], last=focusables[focusables.length-1]
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
  addEventListener('keydown',handle)
  return()=>{removeEventListener('keydown',handle);document.body.style.overflow=oldOverflow;restoreRef.current?.focus()}
 },[open,onClose])
 const med=data.chapterMedians[receipt.chapter]; const chapter=chapters.find(c=>c.id===receipt.chapter)!
 return <AnimatePresence>{open&&<>
   <motion.button className="drawer-backdrop" aria-label="Close evidence drawer" onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduce?0:.18}}/>
   <motion.aside ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="evidence-title" className="evidence-drawer" initial={reduce?{opacity:0}:mobile?{y:'100%'}:{x:'100%'}} animate={reduce?{opacity:1}:{x:0,y:0}} exit={reduce?{opacity:0}:mobile?{y:'100%'}:{x:'100%'}} transition={reduce?{duration:.08}:{type:'spring',stiffness:220,damping:28}}>
    <header><div><p className="eyebrow">Evidence file</p><h2 id="evidence-title">{fmtDate(receipt.date)}</h2></div><button ref={closeRef} onClick={onClose} className="icon-button" aria-label="Close evidence"><X/></button></header>
    <div className="drawer-chapter"><span>{chapter.number} · {chapter.name}</span><p>{chapter.interpretation}</p></div>
    <section><h3>{threads.find(t=>t.id===thread)!.label} thread</h3>
     <div className="evidence-table">{metricSpecs[thread].map(m=>{const raw=receipt[m.key]; const v=typeof raw==='number'?raw:null; const cm=med[String(m.key)]??null; return <div key={String(m.key)}><div><span>{m.label}</span><small>Source: {m.source}</small>{m.qualification&&<small>{m.qualification}</small>}</div><strong>{v==null?'No record':`${v.toFixed(m.digits??0)}${m.unit}`}</strong><em>{pctText(signedPct(v,cm))} vs chapter median</em></div>})}</div>
    </section>
    {receipt.covidResponses&&<section className="context-note"><h3>Period context</h3><p>A COVID-specific EMA answer exists for this day. RADIUS keeps it as contextual evidence but does not convert it into a causal claim.</p></section>}
    <section className="method-note"><h3>Why these records are connected</h3><p>The daily receipts share the same anonymous participant and calendar day. The living radius combines mobility-related sensing only; survey responses remain separately labelled self-reports.</p></section>
   </motion.aside>
 </>}</AnimatePresence>
}
