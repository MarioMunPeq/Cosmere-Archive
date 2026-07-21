/** Simple console logger with timing and status indicators. */

let startTime = 0
let lastLogTime = 0
const INDENT = '  '

export function startSession(): void {
  startTime = performance.now()
  lastLogTime = startTime
  console.log('')
  console.log('Generating Honorblades...')
  console.log('')
}

export function logSuccess(fileName: string): void {
  console.log(`  ✔ ${fileName}`)
}

export function logDetail(label: string, value: string | number): void {
  console.log(`${INDENT}${label}:`)
  console.log(`${INDENT}${INDENT}${value}`)
}

export function logError(fileName: string, message: string): void {
  console.error(`  ✖ ${fileName}`)
  console.error(`${INDENT}Error: ${message}`)
}

export function logSeparator(): void {
  console.log('')
  console.log(`${'─'.repeat(33)}`)
  console.log('')
}

export function endSession(count: number): void {
  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
  console.log('')
  console.log(`Done. ${count} blades generated.`)
  console.log(`Time: ${elapsed} seconds`)
  console.log('')
}
