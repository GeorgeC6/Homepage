export function searchShortcut(platform: string, userAgent: string) {
  return /Mac|iPhone|iPad|iPod/i.test(platform || userAgent)
    ? { label: '⌘ K', keys: 'Meta+K' }
    : { label: 'Ctrl K', keys: 'Control+K' };
}
