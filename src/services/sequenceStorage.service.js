const sequencePrefix = 'sequence-'

export function groupSequencesByCategory(sequences) {
  const groups = new Map()
  for (const sequence of sequences) {
    if (!groups.has(sequence.category)) {
      groups.set(sequence.category, { name: sequence.category, sequences: [] })
    }
    groups.get(sequence.category).sequences.push(sequence)
  }
  return [...groups.values()]
}

export function createSequenceStorage(storage, defaults = []) {
  const get = (id) => {
    const value = storage.getItem(id)
    return value ? JSON.parse(value) : null
  }

  const list = () => {
    const sequences = []
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index)
      if (key?.startsWith(sequencePrefix)) sequences.push(get(key))
    }
    return sequences.filter(Boolean)
  }

  const seedDefaults = () => {
    const savedNames = new Set(list().map((item) => item.name))
    for (const sequence of defaults) {
      if (savedNames.has(sequence.name)) continue
      storage.setItem(sequence.id, JSON.stringify(sequence))
      savedNames.add(sequence.name)
    }
  }

  const save = (details) => {
    const existing = list().find((item) => item.name === details.name)
    if (existing) storage.removeItem(existing.id)

    const id = `${sequencePrefix}${Math.random().toString(36).substring(2, 15)}`
    const sequence = { id, ...details }
    storage.setItem(id, JSON.stringify(sequence))
    return sequence
  }

  const remove = (id) => storage.removeItem(id)

  return { get, list, seedDefaults, save, remove }
}
