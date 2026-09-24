import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createSequenceStorage,
  groupSequencesByCategory,
} from '../src/services/sequenceStorage.service.js'

class MemoryStorage {
  entries = new Map()

  get length() {
    return this.entries.size
  }

  key(index) {
    return [...this.entries.keys()][index] ?? null
  }

  getItem(key) {
    return this.entries.get(key) ?? null
  }

  setItem(key, value) {
    this.entries.set(key, String(value))
  }

  removeItem(key) {
    this.entries.delete(key)
  }
}

test('seeds missing defaults without deleting saved or unrelated browser data', () => {
  const browserStorage = new MemoryStorage()
  browserStorage.setItem('theme', 'dark')
  browserStorage.setItem('sequence-custom', JSON.stringify({ id: 'sequence-custom', name: 'Mine' }))
  const defaults = [{ id: 'sequence-default', name: 'Default' }]
  const storage = createSequenceStorage(browserStorage, defaults)

  storage.seedDefaults()
  storage.seedDefaults()

  assert.equal(browserStorage.getItem('theme'), 'dark')
  assert.deepEqual(
    storage.list().map((item) => item.name),
    ['Mine', 'Default'],
  )
})

test('saving the same name replaces its previous record', () => {
  const storage = createSequenceStorage(new MemoryStorage())
  const first = storage.save({ name: 'Loop', bpm: 120 })
  const second = storage.save({ name: 'Loop', bpm: 140 })

  assert.equal(storage.get(first.id), null)
  assert.deepEqual(storage.list(), [second])
  assert.equal(second.bpm, 140)
})

test('groups sequences by category in first-seen order', () => {
  const sequences = [
    { name: 'A', category: 'Latin' },
    { name: 'B', category: 'EDM' },
    { name: 'C', category: 'Latin' },
  ]

  assert.deepEqual(groupSequencesByCategory(sequences), [
    { name: 'Latin', sequences: [sequences[0], sequences[2]] },
    { name: 'EDM', sequences: [sequences[1]] },
  ])
})
