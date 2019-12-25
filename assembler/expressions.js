const register = '\\s?v([0-9a-fA-F]+)\\s?';
const string   = `"[^"]+"|'[^']+'`;
const value    = `\\s?([0-9a-fA-F\\$%]+|${string})\\s?`;
const values   = `\\s?(${value},?\\s*)+\\s?`;
const label    = '([a-zA-Z0-9\-_]+)';

const nibble   = '[0-9a-fA-F]';
const x        = `(${nibble})`;
const y        = `(${nibble})`;
const n        = `(${nibble})`;
const nn       = `(${nibble}{2})`;
const nnn      = `(${nibble}{3})`;

const hex      = `^\\$[0-9a-fA-F]+$`;
const bin      = `^\\%[01]+$`;
const dec      = `^[0-9]+$`;
const str      = `^"[^"]+"|'[^']+'$`;

module.exports = {
  register,
  string,
  value,
  values,
  label,

  nibble,
  x,
  y,
  n,
  nn,
  nnn,

  hex,
  bin,
  dec,
  str
};
