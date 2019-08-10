'use strict'

const { checkChar, charOffset } = require('./cli-char-supported')
const buf = `${Array(charOffset + 1).join(' ')}`

const color = {
  reset: `\u001b[0m`,
  green: `\u001b[32m`,
  red: `\u001b[31m`,
  blue: `\u001b[34m`,
  yellow: `\u001b[33m`,
  grey: '\u001b[30;1m'
}

let charsChecked = false
const chars = {
  good: { emoji: '✅', plain: `${color.green}[√]` },
  fail: { emoji: '❌', plain: `${color.red}[X]` },
  skip: { emoji: '⛔', plain: `${color.yellow}[-]` },
  todo: { emoji: '⏰', plain: `${color.blue}[!]` },
  okFail: { emoji: '❎', plain: `${color.green}[X]` }
}

const char = (n) => {
  if (!chars[n].useEmoji) return `${chars[n].plain}${color.reset}`
  return `${chars[n].emoji}${color.reset}${buf}`
}

const initCharCheck = async () => {
  if (charsChecked) return

  for (let c of Object.values(chars)) {
    c.useEmoji = await checkChar(c.emoji, 2)
  }

  charsChecked = true
}

const toPrint = (s) => typeof s === 'string' ? `'${s}'` : s

const parseMs = (str) => {
  const intvls = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  const num = parseFloat(str)
  if (Number.isNaN(num)) return 0
  const intvl = (str + '').replace((num + ''), '').trim().charAt(0)
  return num * (intvls[intvl] || 1)
}

const fmtMs = (ms) => {
  ms = ms || 0
  if (ms < 1000) return `${ms || 0}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  let mins = parseInt(ms / 60000, 10)
  return `${mins}m ${((ms - (mins * 60000)) / 1000).toFixed(1)}s`
}

const plural = (c, s) => c > 1 ? `${s || 'test'}s` : `${s || 'test'}`

module.exports = {
  color,
  toPrint,
  initCharCheck,
  char,
  parseMs,
  fmtMs,
  plural
}
