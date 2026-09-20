import type { CSSProperties } from 'react'
import type { LifeReceipt, ThreadId } from '../types/receipts'
import { metricSpecs, threads } from '../lib/metrics'
import { pctText, signedPct } from '../lib/formatters'

export default function ReceiptCard({receipt,thread,baseline,compact=false,metricIndex=0}:{receipt:LifeReceipt,thread:ThreadId,baseline:Record<string,number|null>,compact?:boolean,metricIndex?:number}){
 const specs=metricSpecs[thread]
 const spec=specs[Math.min(metricIndex,specs.length-1)]
 const raw=receipt[spec.key]; const value=typeof raw==='number'?raw:null
 const compare=signedPct(value,baseline[String(spec.key)]??null); const Icon=threads.find(t=>t.id===thread)!.icon
 return <article className={`receipt ${compact?'compact':''}`} style={{'--receipt-accent':threads.find(t=>t.id===thread)!.color} as CSSProperties}>
  <div className="receipt-head"><span><Icon size={15}/>{thread.toUpperCase()} RECEIPT</span><span>{receipt.date}</span></div>
  <div className="receipt-main"><strong>{spec.label}</strong><b>{value==null?'No record':`${value.toFixed(spec.digits??0)}${spec.unit}`}</b></div>
  <div className="receipt-rule"/>
  <p>{pctText(compare)}</p>
  {spec.qualification&&!compact&&<small>{spec.qualification}</small>}
  <footer>Source: {spec.source}</footer>
 </article>
}
