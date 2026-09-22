import type { ChapterId } from '../types/receipts'

export type Chapter = {
  id: ChapterId
  number: string
  name: string
  range: string
  status: string
  observation: string
  interpretation: string
}

export const chapters: Chapter[] = [
  {
    id: 'before', number: '01', name: 'Before', range: 'Sep 2018 — Feb 2020', status: 'A broader daily world',
    observation: 'The earlier pattern spans multiple places, more time on foot, and less time at home.',
    interpretation: 'This chapter is the reference pattern used for later comparisons; it is not a claim about what an ideal routine should look like.'
  },
  {
    id: 'collapse', number: '02', name: 'First Lockdown', range: 'Mar — May 2020', status: 'The radius contracts',
    observation: 'During the first lockdown period, home time rises while travel, places visited, and detected movement on foot fall sharply.',
    interpretation: 'The records show a strong contraction associated with this period. They do not establish that lockdown caused any psychological outcome.'
  },
  {
    id: 'adaptation', number: '03', name: 'Adaptation', range: 'Jun 2020 — May 2021', status: 'A smaller routine stabilises',
    observation: 'The physical world remains narrower on several measures while a different day-to-day pattern takes shape.',
    interpretation: 'The records suggest a changed routine, but they cannot reveal the participant’s reasons, relationships, or private events.'
  },
  {
    id: 'reopening', number: '04', name: 'Reopening', range: 'Jun 2021 — Jun 2022', status: 'Movement expands again',
    observation: 'Travel distance, number of places, and movement on foot return close to or beyond the earlier pattern.',
    interpretation: 'The later routine expands again, although not every signal returns to its earlier median.'
  }
]

export const chapterColors: Record<ChapterId, string> = {
  before: '#7D5E37', collapse: '#8B5961', adaptation: '#6B5470', reopening: '#5A6C54'
}
