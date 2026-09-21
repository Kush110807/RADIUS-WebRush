import type { LifeReceipt, ThreadId } from '../types/receipts'
import { Footprints, MessageCircle, Moon, Smartphone, HeartPulse } from 'lucide-react'

export const threads = [
  { id: 'movement' as ThreadId, label: 'Movement', icon: Footprints, color: '#72E6D1', shortDescription: 'Places · travel · range', description: 'Distance, places, movement and home time' },
  { id: 'connection' as ThreadId, label: 'Connection', icon: MessageCircle, color: '#63B8FF', shortDescription: 'Calls · messages · people', description: 'Calls, SMS and social reports' },
  { id: 'rest' as ThreadId, label: 'Rest', icon: Moon, color: '#C187FF', shortDescription: 'Sleep · downtime', description: 'Model-estimated sleep' },
  { id: 'attention' as ThreadId, label: 'Attention', icon: Smartphone, color: '#FFC44D', shortDescription: 'Unlocks · apps · focus', description: 'Unlocks and background-app observations' },
  { id: 'emotion' as ThreadId, label: 'Emotion', icon: HeartPulse, color: '#FF6F91', shortDescription: 'Stress · affect · mood', description: 'Self-reported stress and affect' },
]

export type MetricSpec = { key: keyof LifeReceipt; label: string; unit: string; digits?: number; qualification?: string; source: string }
export const metricSpecs: Record<ThreadId, MetricSpec[]> = {
  movement: [
    {key:'distanceKm',label:'Distance travelled',unit:' km',digits:2,source:'Daily mobile sensing'},
    {key:'placesVisited',label:'Places visited',unit:'',digits:0,source:'Daily mobile sensing'},
    {key:'movementMinutes',label:'Detected movement on foot',unit:' min',digits:0,source:'Daily mobile sensing'},
    {key:'homeHours',label:'Time at home',unit:' h',digits:1,source:'Daily mobile sensing'},
    {key:'studyHours',label:'Time at study locations',unit:' h',digits:1,source:'Daily mobile sensing'},
  ],
  connection: [
    {key:'incomingCalls',label:'Incoming calls',unit:'',source:'Daily mobile sensing'},
    {key:'outgoingCalls',label:'Outgoing calls',unit:'',source:'Daily mobile sensing'},
    {key:'incomingMessages',label:'Incoming SMS',unit:'',source:'Daily mobile sensing'},
    {key:'outgoingMessages',label:'Outgoing SMS',unit:'',source:'Daily mobile sensing'},
    {key:'socialLevel',label:'Self-reported social level',unit:'/5',digits:0,qualification:'Self-report available on survey days only.',source:'General EMA'},
    {key:'conversationMinutes',label:'Detected conversation',unit:' min',digits:0,qualification:'Passive audio-derived detection; no speech content is stored or shown, and availability varies by day.',source:'Daily audio sensing feature'},
  ],
  rest: [
    {key:'sleepHours',label:'Model-estimated sleep',unit:' h',digits:2,qualification:'A model estimate, not a clinical or wearable sleep measurement.',source:'Daily sensing model'},
  ],
  attention: [
    {key:'unlocks',label:'Phone unlocks',unit:'',source:'Daily mobile sensing'},
    {key:'backgroundAppsObserved',label:'Background applications observed',unit:'',source:'Raw running-app events',qualification:'Observation count only; not foreground usage or time spent.'},
  ],
  emotion: [
    {key:'stress',label:'Self-reported stress',unit:'/5',digits:0,source:'General EMA',qualification:'Self-report available on survey days only; not a diagnosis.'},
    {key:'affect',label:'Photographic Affect Meter',unit:'/16',digits:0,source:'General EMA',qualification:'Available only when the participant answered the EMA; shown as the recorded PAM response, not a diagnosis.'},
  ],
}
