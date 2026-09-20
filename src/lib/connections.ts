import type { LifeReceipt } from '../types/receipts'

export const unusualScore = (r: LifeReceipt, baseline: Record<string, number | null>) => {
  const keys: (keyof LifeReceipt)[] = ['distanceKm','placesVisited','movementMinutes','homeHours','unlocks','sleepHours']
  return keys.reduce((sum,k) => {
    const v=r[k]; const b=baseline[String(k)]
    return typeof v==='number' && typeof b==='number' && b!==0 ? sum + Math.abs((v-b)/b) : sum
  },0)
}
