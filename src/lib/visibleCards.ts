let count = 0

export function incrementVisibleCards(): void {
  count++
}

export function getVisibleCards(): number {
  return count
}

export function resetVisibleCards(): void {
  count = 0
}
