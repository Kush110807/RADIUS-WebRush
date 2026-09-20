import { useMemo } from 'react'
import type { LifeReceipt } from '../types/receipts'
export function useTimeline(records: LifeReceipt[], index: number) {
  return useMemo(()=>({current:records[index], previous:records.slice(Math.max(0,index-12),index)}),[records,index])
}
