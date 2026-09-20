import { useMemo } from 'react'
import type { ChapterId, LifeReceipt, ThreadId } from '../types/receipts'
import { metricSpecs, threads } from '../lib/metrics'
import { fmtDate } from '../lib/formatters'
import { unusualScore } from '../lib/connections'

export function useReceiptSearch(records:LifeReceipt[], query:string, chapter:ChapterId|'all', thread:ThreadId|'all', sort:'date-desc'|'date-asc'|'unusual', baseline:Record<string,number|null>) {
 return useMemo(()=>{
  const q=query.trim().toLowerCase()
  const relevantKeys=thread==='all' ? [] : metricSpecs[thread].map(m=>m.key)
  const filtered=records.filter(r=>{
    if(chapter!=='all'&&r.chapter!==chapter) return false
    if(thread!=='all'&&!relevantKeys.some(k=>r[k]!=null)) return false
    if(!q) return true
    const availableTerms=threads.flatMap(t=>{
      const available=metricSpecs[t.id].filter(m=>r[m.key]!=null)
      if(!available.length) return []
      return [t.label,...available.map(m=>m.label)]
    })
    const aliases=[r.incomingMessages!=null||r.outgoingMessages!=null?'sms messages':'',r.incomingCalls!=null||r.outgoingCalls!=null?'calls':'',r.backgroundAppsObserved!=null?'apps applications':'']
    const hay=[r.date,fmtDate(r.date).toLowerCase(),r.chapter,r.date.slice(0,4),...availableTerms,...aliases].join(' ').toLowerCase()
    return hay.includes(q)
  })
  return [...filtered].sort((a,b)=>sort==='date-asc'?a.date.localeCompare(b.date):sort==='date-desc'?b.date.localeCompare(a.date):unusualScore(b,baseline)-unusualScore(a,baseline))
 },[records,query,chapter,thread,sort,baseline])
}
