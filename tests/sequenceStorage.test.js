import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createSequenceStorage,
  groupSequencesByCategory,
} from '../src/services/sequenceStorage.service.js'
import { countLoopPages, getLoopPageSlots } from '../src/services/loopLayout.service.js'

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

test('assigns positions to legacy loops without replacing occupied slots', () => {
  const browserStorage = new MemoryStorage()
  browserStorage.setItem('theme', 'dark')
  browserStorage.setItem('sequence-a', JSON.stringify({ id: 'sequence-a', category: 'ช้า' }))
  browserStorage.setItem(
    'sequence-b',
    JSON.stringify({ id: 'sequence-b', category: 'ช้า', position: 2 }),
  )
  browserStorage.setItem(
    'sequence-c',
    JSON.stringify({ id: 'sequence-c', category: 'ช้า', position: 2 }),
  )
  const storage = createSequenceStorage(browserStorage)

  storage.ensurePositions()

  assert.deepEqual(
    storage.list().map((item) => item.position),
    [0, 2, 1],
  )
  assert.equal(browserStorage.getItem('theme'), 'dark')
})

test('moves loops across pages and swaps occupied slots persistently', () => {
  const browserStorage = new MemoryStorage()
  const storage = createSequenceStorage(browserStorage)
  const first = storage.save({ name: 'First', category: 'ช้า' })
  const second = storage.save({ name: 'Second', category: 'ช้า' })
  const otherGroup = storage.save({ name: 'Fast', category: 'เร็ว' })

  assert.equal(storage.move(first.id, 16), true)
  assert.equal(storage.move(first.id, 1), true)

  const restored = createSequenceStorage(browserStorage)
  assert.equal(restored.get(first.id).position, 1)
  assert.equal(restored.get(second.id).position, 16)
  assert.equal(restored.get(otherGroup.id).position, 0)
})

test('preserves a loop position when saving the same name again', () => {
  const storage = createSequenceStorage(new MemoryStorage())
  const first = storage.save({ name: 'Loop', category: 'ช้า' })
  storage.move(first.id, 9)

  const replacement = storage.save({ name: 'Loop', category: 'ช้า', bpm: 140 })

  assert.equal(replacement.position, 9)
  assert.equal(storage.get(first.id), null)
})

test('keeps sixteen visible slots and adds a new page when full', () => {
  const sequences = Array.from({ length: 16 }, (_, position) => ({ position }))

  assert.equal(countLoopPages(sequences), 2)
  assert.equal(getLoopPageSlots(sequences, 1).length, 16)
  assert.ok(getLoopPageSlots(sequences, 1).every((slot) => slot.sequence === null))
  assert.equal(countLoopPages(sequences.slice(0, 15)), 1)

  const storage = createSequenceStorage(new MemoryStorage())
  for (let index = 0; index < 16; index++) storage.save({ name: `Loop ${index}`, category: 'ช้า' })
  assert.equal(storage.save({ name: 'Loop 16', category: 'ช้า' }).position, 16)
})
