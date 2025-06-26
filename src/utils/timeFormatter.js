import { format, parse, parseISO, isValid } from 'date-fns'

export function formatTime12(timeStr) {
  if (!timeStr) return ''
  try {
    let parsed

    if (typeof timeStr === 'string' && timeStr.length <= 5 && timeStr.includes(':')) {
      parsed = parse(timeStr, 'HH:mm', new Date())
    } else {
      parsed = parseISO(timeStr)
    }

    return isValid(parsed) ? format(parsed, 'h:mm a') : ''
  } catch {
    return ''
  }
}
