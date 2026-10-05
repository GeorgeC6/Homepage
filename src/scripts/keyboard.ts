export function searchShortcut(platform: string, userAgent: string, touchPoints = 0) {
  if (/iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || (/Mac/i.test(platform || userAgent) && touchPoints > 1)) return null;
  return /Mac/i.test(platform || userAgent)
    ? { label: '⌘ K', keys: 'Meta+K' }
    : { label: 'Ctrl K', keys: 'Control+K' };
}
