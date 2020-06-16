// Internal primitives
const string   = `"[^"]+"|'[^']+'`;
const number   = '[0-9a-fA-F\\$%]+';
const nibble   = '[0-9a-fA-F]';
const value    = `(?:${number}|${string})`;
const values   = `(?:${value},?\\s*)+`;
const label    = '[a-zA-Z0-9\-_]+';
const w        = '\\s?'; // w for whitespace
const expr     = `${label}${w}\\+${w}${number}`; // Label plus offset

// Instruction parameters for assembler
const reg      = `${w}v(${nibble}{1,2})${w}`;
const val      = `${w}(${value})${w}`;
const vals     = `${w}(${values})${w}`;
const loc      = `${w}(${number}|${label}|${expr})${w}`;
const lab      = `(${label})`;

// Hexadecimal values for opcodes
const x        = `(${nibble})`;
const y        = `(${nibble})`;
const n        = `(${nibble})`;
const nn       = `(${nibble}{2})`;
const nnn      = `(${nibble}{3})`;

// Numeric value types for checking what we're dealing with
const hex      = `^\\$${nibble}+$`;
const bin      = `^\\%[01]+$`;
const dec      = `^[0-9]+$`;
const str      = `^${string}$`;

module.exports = {
  label, number, w,
  reg, val, vals, loc, lab,
  x, y, n, nn, nnn,
  hex, bin, dec, str
};
