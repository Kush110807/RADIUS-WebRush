export type ChapterId = 'before' | 'collapse' | 'adaptation' | 'reopening'
export type ThreadId = 'movement' | 'connection' | 'rest' | 'attention' | 'emotion'

export type LifeReceipt = {
  date: string
  chapter: ChapterId
  homeHours: number | null
  studyHours: number | null
  distanceKm: number | null
  placesVisited: number | null
  movementMinutes: number | null
  timeAwayHours: number | null
  sleepHours: number | null
  unlocks: number | null
  incomingCalls: number | null
  outgoingCalls: number | null
  incomingMessages: number | null
  outgoingMessages: number | null
  conversationMinutes: number | null
  conversationCount: number | null
  stress: number | null
  socialLevel: number | null
  affect: number | null
  backgroundAppsObserved: number | null
  uniqueBackgroundApps: number | null
  covidResponses: (number | null)[] | null
  radiusScore: number | null
}

export type DataPayload = {
  participant: string
  range: { start: string; end: string; days: number }
  verification: {
    generalStressResponses: number
    generalSocialResponses: number
    covidSpecificResponses: number
    usableCovidResponses: number
    deployedStressDays: number
    deployedSocialDays: number
    deployedAffectDays: number
    deployedCovidDays: number
    locationCoverageDays: number
    rawCallRecords: number
    rawSmsRecords: number
    backgroundApplicationObservations: number
    deployedBackgroundApplicationObservations: number
    rawUnlockEvents: number
  }
  normalisation: {
    method: string
    bounds: Record<string, [number, number]>
    baselineRadiusScore: number
  }
  chapterMedians: Record<ChapterId, Record<string, number | null>>
  records: LifeReceipt[]
}
