const e = require('./expressions');

module.exports = [
  {
    instruction: `.org ${e.val}$`,
    getAddress:  (lastAddress, [addr]) => addr
  },
  {
    type:        'label',
    instruction: `^${e.lab}:$`
  },
  {
    instruction: `\.db ${e.vals}$`,
    assemble:    bytes => bytes,
    getAddress:  (lastAddress, bytes) => 1 * lastAddress + bytes.length
  }
]
