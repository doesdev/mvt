'use strict'

const thisThrows = () => {
  const a = 'a string'
  a.map((b) => b)
}

module.exports = () => {
  thisThrows()
}
