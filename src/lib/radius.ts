import type { LifeReceipt, ThreadId } from '../types/receipts'

export const visualRadius = (score: number | null, size = 500) => {
  const s = score ?? 0
  return Math.max(66, Math.min(size * 0.42, 72 + s * 1.35))
}

const present = (...values: Array<number | null>) => values.some((value) => value != null)

/**
 * A lightweight 0–100 emphasis signal for the currently selected evidence thread.
 * This is deliberately separate from the mobility-based living-radius score.
 * Missing evidence returns null so the visual never turns "missing" into zero.
 */
export const threadPulse = (receipt: LifeReceipt, thread: ThreadId): number | null => {
  switch (thread) {
    case 'movement':
      return receipt.radiusScore

    case 'connection': {
      const values = [
        receipt.incomingCalls,
        receipt.outgoingCalls,
        receipt.incomingMessages,
        receipt.outgoingMessages,
        receipt.socialLevel,
        receipt.conversationMinutes,
      ]
      if (!present(...values)) return null
      return Math.min(
        100,
        ((receipt.incomingCalls ?? 0) + (receipt.outgoingCalls ?? 0)) * 8
          + ((receipt.incomingMessages ?? 0) + (receipt.outgoingMessages ?? 0)) * 0.8
          + (receipt.socialLevel ?? 0) * 5
          + Math.min(20, (receipt.conversationMinutes ?? 0) / 15),
      )
    }

    case 'rest':
      return receipt.sleepHours == null
        ? null
        : Math.min(100, Math.max(0, (receipt.sleepHours / 10) * 100))

    case 'attention':
      if (!present(receipt.unlocks, receipt.backgroundAppsObserved)) return null
      return Math.min(
        100,
        (receipt.unlocks ?? 0) * 0.55 + (receipt.backgroundAppsObserved ?? 0) * 0.2,
      )

    case 'emotion':
      return receipt.stress == null ? null : Math.min(100, (receipt.stress / 5) * 100)
  }
}
