const sequencePrefix = 'sequence-'
const backupFormat = 'percussion-loop-backup'

const isValidPosition = (position) => Number.isSafeInteger(position) && position >= 0

const firstOpenPosition = (sequences, category) => {
  const occupied = new Set(
    sequences
      .filter((sequence) => sequence.category === category && isValidPosition(sequence.position))
      .map((sequence) => sequence.position),
  )
  let position = 0
  while (occupied.has(position)) position++
  return position
}

export function groupSequencesByCategory(sequences) {
  const groups = new Map()
  for (const sequence of sequences) {
    if (!groups.has(sequence.category)) {
      groups.set(sequence.category, { name: sequence.category, sequences: [] })
    }
    groups.get(sequence.category).sequences.push(sequence)
  }
  return [...groups.values()].map((group) => ({
    ...group,
    sequences: group.sequences.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
  }))
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

  const ensurePositions = () => {
    const sequences = list()
    const occupied = new Map()
    const missing = []

    for (const sequence of sequences) {
      if (!occupied.has(sequence.category)) occupied.set(sequence.category, new Set())
      const positions = occupied.get(sequence.category)
      if (!isValidPosition(sequence.position) || positions.has(sequence.position)) {
        missing.push(sequence)
        continue
      }
      positions.add(sequence.position)
    }

    for (const sequence of missing) {
      const positions = occupied.get(sequence.category)
      let position = 0
      while (positions.has(position)) position++
      storage.setItem(sequence.id, JSON.stringify({ ...sequence, position }))
      positions.add(position)
    }
  }

  const save = (details) => {
    const sequences = list()
    const existing = sequences.find((item) => item.name === details.name)
    const position =
      existing && existing.category === details.category && isValidPosition(existing.position)
        ? existing.position
        : firstOpenPosition(
            sequences.filter((item) => item.id !== existing?.id),
            details.category,
          )
    if (existing) storage.removeItem(existing.id)

    const id = `${sequencePrefix}${Math.random().toString(36).substring(2, 15)}`
    const sequence = { id, ...details, position }
    storage.setItem(id, JSON.stringify(sequence))
    return sequence
  }

  const remove = (id) => storage.removeItem(id)

  const move = (id, targetPosition, targetCategory) => {
    const source = get(id)
    if (!source || !isValidPosition(source.position) || !isValidPosition(targetPosition))
      return false
    if (targetCategory !== undefined && source.category !== targetCategory) return false
    if (source.position === targetPosition) return true

    const target = list().find(
      (item) => item.category === source.category && item.position === targetPosition,
    )
    storage.setItem(id, JSON.stringify({ ...source, position: targetPosition }))
    if (target) {
      storage.setItem(target.id, JSON.stringify({ ...target, position: source.position }))
    }
    return true
  }

  const exportBackup = () => ({
    format: backupFormat,
    version: 1,
    exportedAt: new Date().toISOString(),
    sequences: list(),
  })

  const importBackup = (backup) => {
    if (
      !backup ||
      backup.format !== backupFormat ||
      backup.version !== 1 ||
      !Array.isArray(backup.sequences)
    ) {
      throw new Error('ไฟล์สำรองไม่ถูกต้องหรือเป็นเวอร์ชันที่ไม่รองรับ')
    }

    const ids = new Set()
    for (const item of backup.sequences) {
      if (
        !item ||
        typeof item.id !== 'string' ||
        !item.id.startsWith(sequencePrefix) ||
        ids.has(item.id) ||
        typeof item.name !== 'string' ||
        typeof item.category !== 'string' ||
        typeof item.color !== 'string' ||
        typeof item.numpad !== 'string' ||
        !Number.isFinite(item.bpm) ||
        !Array.isArray(item.sequence) ||
        item.sequence.length !== 13 ||
        // Some shipped default loops have a short row; playback treats absent steps as off.
        !item.sequence.every(
          (row) =>
            Array.isArray(row) &&
            row.length > 0 &&
            row.length <= 32 &&
            row.every((step) => typeof step === 'boolean'),
        ) ||
        (item.position !== undefined && !isValidPosition(item.position))
      ) {
        throw new Error('ข้อมูลจังหวะในไฟล์สำรองไม่ถูกต้อง')
      }
      ids.add(item.id)
    }

    const previous = list()
    try {
      for (const item of previous) storage.removeItem(item.id)
      for (const item of backup.sequences) storage.setItem(item.id, JSON.stringify(item))
      ensurePositions()
    } catch (error) {
      for (const item of backup.sequences) storage.removeItem(item.id)
      for (const item of previous) storage.setItem(item.id, JSON.stringify(item))
      throw error
    }

    return backup.sequences.length
  }

  return {
    get,
    list,
    seedDefaults,
    ensurePositions,
    save,
    remove,
    move,
    exportBackup,
    importBackup,
  }
}
