import { memo, useId, useMemo } from 'react'
import { motion } from 'motion/react'
import type { LifeReceipt, ThreadId } from '../types/receipts'
import { chapterColors } from '../data/chapters'
import { threads } from '../lib/metrics'
import { visualRadius, threadPulse } from '../lib/radius'
import { fmtDate } from '../lib/formatters'
import { useReducedMotion } from '../hooks/useReducedMotion'

function LivingRadius({receipt,trail,thread,baselineScore}:{receipt:LifeReceipt,trail:LifeReceipt[],thread:ThreadId,baselineScore:number}){
 const reduce=useReducedMotion(); const filterId=useId().replace(/:/g,'')
 const radius=visualRadius(receipt.radiusScore); const baseline=visualRadius(baselineScore)
 const accent=threads.find(t=>t.id===thread)?.color ?? chapterColors[receipt.chapter]
 const nodes=useMemo(()=>Array.from({length:Math.max(1,Math.min(8,receipt.placesVisited??1))},(_,i)=>{
   const count=Math.max(1,Math.min(8,receipt.placesVisited??1)); const a=(Math.PI*2*i)/count-.8; const rr=radius+18+(i%2)*8
   return {x:250+Math.cos(a)*rr,y:250+Math.sin(a)*rr,r:3+(i%3)}
 }),[receipt.placesVisited,radius])
 const trailPoints=trail.map((r,i)=>{const a=-2.25+(i/Math.max(1,trail.length-1))*1.3; const rr=visualRadius(r.radiusScore); return `${250+Math.cos(a)*rr},${250+Math.sin(a)*rr}`}).join(' ')
 const pulse=threadPulse(receipt,thread); const signalRadius=pulse==null?null:55+(pulse/100)*78
 return <motion.figure layoutId="living-radius" className="radius-figure" aria-labelledby="radius-title radius-caption">
  <svg viewBox="0 0 500 500" role="img" aria-labelledby="radius-title radius-desc">
   <title id="radius-title">Living radius for {fmtDate(receipt.date)}</title>
   <desc id="radius-desc">A visual storytelling radius based on distance travelled, places visited, movement on foot and time away from home. Current score {receipt.radiusScore??'unavailable'} out of 100. The dotted reference ring is the pre-lockdown median. A dashed inner signal ring emphasises the selected {thread} thread.</desc>
   <defs><filter id={filterId}><feGaussianBlur stdDeviation="8"/></filter></defs>
   <circle cx="250" cy="250" r="208" className="orbit outer"/>
   <circle cx="250" cy="250" r="160" className="orbit"/>
   <circle cx="250" cy="250" r={baseline} className="baseline-ring"/>
   {trailPoints && <polyline points={trailPoints} className="trail"/>}
   <motion.circle cx="250" cy="250" animate={{r:radius,opacity:.12+.16*((pulse??0)/100)}} transition={reduce?{duration:0}:{type:'spring',stiffness:95,damping:22}} fill={accent} filter={`url(#${filterId})`}/>
   <motion.circle cx="250" cy="250" animate={{r:radius}} transition={reduce?{duration:0}:{type:'spring',stiffness:95,damping:22}} fill="transparent" stroke={chapterColors[receipt.chapter]} strokeWidth="1.6" className="main-boundary"/>
   {signalRadius!=null&&<motion.circle cx="250" cy="250" animate={{r:signalRadius}} transition={reduce?{duration:0}:{type:'spring',stiffness:110,damping:24}} fill="none" stroke={accent} strokeWidth="1.4" strokeDasharray="5 9" opacity=".68"/>}
   {nodes.map((n,i)=><motion.circle key={`${receipt.date}-${i}`} initial={reduce?false:{opacity:0,scale:.4}} animate={{opacity:1,scale:1}} transition={{delay:reduce?0:i*.025}} cx={n.x} cy={n.y} r={n.r} fill={chapterColors[receipt.chapter]}/>) }
   <circle cx="250" cy="250" r="33" className="home-core"/><circle cx="250" cy="250" r="4" fill={accent}/>
   <text x="250" y="238" textAnchor="middle" className="svg-kicker">LIVING RADIUS</text>
   <text x="250" y="270" textAnchor="middle" className="svg-score">{receipt.radiusScore==null?'—':Math.round(receipt.radiusScore)}</text>
   <text x="250" y="289" textAnchor="middle" className="svg-meta">visual score · /100</text>
  </svg>
  <figcaption id="radius-caption"><span><i style={{background:accent}}/> {pulse==null?`No ${thread} observation this day`:`${thread} signal`}</span><span>Dotted ring = pre-lockdown median</span></figcaption>
 </motion.figure>
}
export default memo(LivingRadius)
