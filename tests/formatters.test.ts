import test from 'node:test'
import assert from 'node:assert/strict'
import { comparisonFromPct, comparisonText, signedPct } from '../src/lib/formatters.ts'

test('equal values use human median language', () => {
  assert.equal(comparisonText(10, 10, 'chapter'), 'At chapter median')
  assert.equal(comparisonText(10, 10, 'Before'), 'At Before median')
})

test('near-equal values within tolerance do not produce 0% above/below', () => {
  assert.equal(comparisonText(100.4, 100, 'chapter'), 'At chapter median')
  assert.equal(comparisonFromPct(-0.2, 'Before'), 'At Before median')
  assert.equal(comparisonFromPct(-0.01, 'chapter'), 'At chapter median')
})

test('positive and negative differences are labelled consistently', () => {
  assert.equal(comparisonText(114, 100, 'chapter'), '14% above chapter median')
  assert.equal(comparisonText(64, 100, 'chapter'), '36% below chapter median')
})

test('missing, zero or invalid baselines never create invalid percentages', () => {
  assert.equal(comparisonText(null, 10), 'No baseline comparison')
  assert.equal(comparisonText(10, null), 'No baseline comparison')
  assert.equal(comparisonText(10, 0), 'No baseline comparison')
  assert.equal(comparisonFromPct(Number.NaN), 'No baseline comparison')
  assert.equal(comparisonFromPct(Number.POSITIVE_INFINITY), 'No baseline comparison')
  assert.equal(signedPct(10, 0), null)
})


test('negative zero and zero deltas never leak mechanical language', () => {
  assert.equal(comparisonFromPct(-0, 'chapter'), 'At chapter median')
  assert.equal(comparisonFromPct(0, 'Before'), 'At Before median')
  assert.equal(comparisonText(Number.POSITIVE_INFINITY, 10), 'No baseline comparison')
})
