import { checkChar, charOffset } from './cli-char-supported.js'

const buf = `${Array(charOffset + 1).join(' ')}`

export const color = {
  reset: '\u001b[0m',
  green: '\u001b[32m',
  red: '\u001b[31m',
  blue: '\u001b[34m',
  yellow: '\u001b[33m',
  grey: '\u001b[30;1m'
}

let charsChecked = false
export const chars = {
  good: { emoji: '✅', plain: `${color.green}[√]` },
  fail: { emoji: '❌', plain: `${color.red}[X]` },
  skip: { emoji: '⛔', plain: `${color.yellow}[-]` },
  todo: { emoji: '⏰', plain: `${color.blue}[!]` },
  okFail: { emoji: '❎', plain: `${color.green}[X]` }
}

export const char = (n) => {
  if (!chars[n].useEmoji) return `${chars[n].plain}${color.reset}`
  return `${chars[n].emoji}${color.reset}${buf}`
}

export const initCharCheck = async () => {
  if (charsChecked) return

  for (const c of Object.values(chars)) {
    c.useEmoji = await checkChar(c.emoji, 2)
  }

  charsChecked = true
}

export const toPrint = (s) => typeof s === 'string' ? `'${s}'` : s

export const parseMs = (str) => {
  const intvls = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  const num = parseFloat(str)
  if (Number.isNaN(num)) return 0
  const intvl = (str + '').replace((num + ''), '').trim().charAt(0)
  return num * (intvls[intvl] || 1)
}

export const fmtMs = (ms) => {
  ms = ms || 0
  if (ms < 1000) return `${ms || 0}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const mins = parseInt(ms / 60000, 10)
  return `${mins}m ${((ms - (mins * 60000)) / 1000).toFixed(1)}s`
}

export const plural = (c, s) => c > 1 ? `${s || 'test'}s` : `${s || 'test'}`
