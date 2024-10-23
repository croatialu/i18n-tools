export function formatTime(time?: Date): string {
  return time ? time.toLocaleString() : new Date().toLocaleString()
}
