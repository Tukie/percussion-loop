export const LOOP_PAGE_SIZE = 16

export function countLoopPages(sequences) {
  const maxPosition = Math.max(-1, ...sequences.map((sequence) => sequence.position))
  const occupiedPages = Math.max(1, Math.floor(maxPosition / LOOP_PAGE_SIZE) + 1)
  return sequences.length === occupiedPages * LOOP_PAGE_SIZE ? occupiedPages + 1 : occupiedPages
}

export function getLoopPageSlots(sequences, page) {
  const byPosition = new Map(sequences.map((sequence) => [sequence.position, sequence]))
  const firstPosition = page * LOOP_PAGE_SIZE
  return Array.from({ length: LOOP_PAGE_SIZE }, (_, offset) => ({
    position: firstPosition + offset,
    sequence: byPosition.get(firstPosition + offset) ?? null,
  }))
}
