const e = require('./expressions');

module.exports = [
  {
    instruction: `.org ${e.value}$`,
    place:       (old, [addr]) => addr
  },
  {
    type:        'label',
    instruction: `^${e.label}:$`
  },
  {
    instruction: `\.db (${e.values})$`,
    assemble:    ([bytes]) => bytes
  }
]
