// Opcodes as documented at:
//   * https://en.wikipedia.org/wiki/CHIP-8
//   * http://mattmik.com/files/chip8/mastering/chip8.html
//   * http://devernay.free.fr/hacks/chip8/C8TECH10.HTM

const s = require('./binary_strings');
const keyboard = require('./keyboard');

module.exports = {

  '00E0': ({state}) => {
    for ( let n = 0x0F00; n <= 0x0FFF; n++ ) state.ram[n] = 0;
    state.sd = true;
    return 'cls';
  },

  '00EE': ({state, disassemble}) => {
    if ( disassemble )
      return 'ret';

    state.sp += 2;
    state.pc = state.ram[state.sp - 0] * 0x100 + state.ram[state.sp - 1];
    return `ret (to ${s.word2str(state.pc)})`;
  },

  '0...': ({state, nnn}) => {
    console.error('RCA 1802 Not implemented');
    return `rca 1802 call ${s.word2str(nnn)}`;
  },

  '1...': ({state, nnn}) => {
    state.pc = nnn - 2; // Step back one instruction because we step ahead later
    return `jp ${s.word2str(nnn)}`;
  },

  '2...': ({state, nnn}) => {
    state.ram[state.sp - 0] = (state.pc & 0xff00) / 0x100;
    state.ram[state.sp - 1] =  state.pc & 0x00ff;
    state.sp -= 2;
    state.pc = nnn - 2; // Step back one instruction because we step ahead later
    return `call ${s.word2str(nnn)}`;
  },

  '3...': ({state, x, nn}) => {
    if ( state.v[x] === nn ) state.pc += 2;
    return `se v${x}, ${s.byte2str(nn)}`;
  },

  '4...': ({state, x, nn}) => {
    if ( state.v[x] !== nn ) state.pc += 2;
    return `sne v${x}, ${s.byte2str(nn)}`;
  },

  '5..0': ({state, x, y}) => {
    if ( state.v[x] === state.v[y] ) state.pc += 2;
    return `se v${x}, v${y}`;
  },

  '6...': ({state, x, nn}) => {
    state.v[x] = nn;
    return `ld v${x}, ${s.byte2str(nn)}`;
  },

  '7...': ({state, x, nn}) => {
    state.v[x] += nn;
    return `add v${x}, ${s.byte2str(nn)}`;
  },

  '8..0': ({state, x, y}) => {
    state.v[x] = state.v[y];
    return `ld v${x}, v${y}`;
  },

  '8..1': ({state, x, y}) => {
    state.v[x] |= state.v[y];
    return `or v${x}, v${y}`;
  },

  '8..2': ({state, x, y}) => {
    state.v[x] &= state.v[y];
    return `and v${x}, v${y}`;
  },

  '8..3': ({state, x, y}) => {
    state.v[x] ^= state.v[y];
    return `xor v${x}, v${y}`;
  },

  '8..4': ({state, x, y}) => {
    // Set VF to 01 if a carry occurs
    // Set VF to 00 if a carry does not occur
    state.v[0xF] = (state.v[x] + state.v[y]) > 0xFF ? 1 : 0;
    state.v[x]  += state.v[y];
    return `add v${x}, v${y}`;
  },

  '8..5': ({state, x, y}) => {
    // Set VF to 00 if a borrow occurs
    // Set VF to 01 if a borrow does not occur
    state.v[0xF] = state.v[y] > state.v[x] ? 0 : 1;
    state.v[x]  -= state.v[y];
    return `sub v${x}, v${y}`;
  },

  '8..6': ({state, x}) => {
    // Set register VF to the least significant bit prior to the shift
    state.v[0xF] = state.v[x] & 0b00000001 ? 1 : 0;
    state.v[x]   = state.v[x] >> 1;
    return `shr v${x}`;
  },

  '8..7': ({state, x, y}) => {
    // Set VF to 00 if a borrow occurs
    // Set VF to 01 if a borrow does not occur
    state.v[0xF] = state.v[x] > state.v[y] ? 0 : 1;
    state.v[x]   = state.v[y] - state.v[x];
    return `subn v${x}, v${y}`;
  },

  '8..E': ({state, x}) => {
    // Set register VF to the most significant bit prior to the shift
    state.v[0xF] = state.v[x] & 0b10000000 ? 1 : 0;
    state.v[x]   = state.v[x] << 1;
    return `shl v${x}`;
  },

  '9..0': ({state, x, y}) => {
    if ( state.v[x] !== state.v[y] ) state.pc += 2;
    return `sne v${x}, v${y}`;
  },

  'A...': ({state, nnn}) => {
    state.i = nnn;
    return `ld i, ${s.word2str(nnn)}`;
  },

  'B...': ({state, nnn}) => {
    state.pc = nnn + state.v[0] - 2; // Step back one instruction because we step ahead later
    return `jp v0, ${s.word2str(nnn)}`;
  },

  'C...': ({state, x, nn}) => {
    state.v[x] = Math.floor(Math.random() * 0x100) & nn;
    return `rnd v${x}, ${s.byte2str(nn)}`;
  },

  'D...': ({state, x, y, n}) => {
    // Set VF to 01 if any set pixels are changed to unset, and 00 otherwise
    const xPos = state.v[x];
    const yPos = state.v[y];

    const memoryOffset = Math.floor(yPos * 8 + xPos / 8);
    let erases = false;

    for ( let i = 0; i < n; i++ ) {
      const spritePart = state.ram[state.i + i];

      // If video ram AND sprite > 0, they share pixels. If they share pixels,
      // this will lead to erases because of the XOR.
      erases |= !!(state.ram[0x0F00 + memoryOffset + i * 8 + 0] & spritePart >> (xPos % 8)) ||
                !!(state.ram[0x0F00 + memoryOffset + i * 8 + 1] & spritePart << (8 - (xPos % 8)) & 0xFF);

      state.ram[0x0F00 + memoryOffset + i * 8 + 0] ^= spritePart >> (xPos % 8);
      state.ram[0x0F00 + memoryOffset + i * 8 + 1] ^= spritePart << (8 - (xPos % 8)) & 0xFF;
    }
    state.sd = true;
    state.v[0xF] = erases ? 1 : 0;

    return `drw v${x}, v${y}, ${n} (with ${s.word2str(state.i)} in i)`;
  },

  'E.9E': ({state, x}) => {
    if ( keyboard.pressed(state.v[x]) ) state.pc += 2;
    return `skp v${x}`;
  },

  'E.A1': ({state, x}) => {
    if ( !keyboard.pressed(state.v[x]) ) state.pc += 2;
    return `sknp v${x}`;
  },

  'F.07': ({state, x}) => {
    state.v[x] = state.delay;
    return `ld v${x}, dt`;
  },

  'F.0A': ({state, x, disassemble}) => {
    if ( disassemble )
      return `getkey v${x}`;

    return keyboard.waitPress()
                   .then(key => {
                     state.v[x] = key;
                     return `getkey v${x}`;
                   });
  },

  'F.15': ({state, x}) => {
    state.delay = state.v[x];
    return `ld dt, v${x}`;
  },

  'F.18': ({state, x}) => {
    state.sound = state.v[x];
    return `ld st, v${x}`;
  },

  'F.1E': ({state, x}) => {
    // Overflow stored in VF according to Wikipedia, not
    // according to both other sources... :/
    // state.v[0xF] = (state.i + state.v[x]) > 0xFFF ? 1 : 0;
    state.i = (state.i + state.v[x]) & 0xFFF;
    return `add i, v${x}`;
  },

  'F.29': ({state, x}) => {
    // Font is stored in first part of memory,
    // each character is 5 bytes, so:
    state.i = state.v[x] * 5;
    return `getfont v${x}`;
  },

  'F.33': ({state, x}) => {
    state.ram[state.i + 0] = state.v[x] / 100;
    state.ram[state.i + 1] = state.v[x] % 100 / 10;
    state.ram[state.i + 2] = state.v[x] % 10;
    return `bcd (i), v${x}`;
  },

  'F.55': ({state, x}) => {
    // I is set to I + X + 1 after operation according to mattmik, left
    // untouched according to Wikipedia, devernay has no mention of i... :/
    for ( let n = 0; n <= x; n++ )
      state.ram[state.i + n] = state.v[n];
    // state.i += x + 1;
    return `ld (i), v0-v${x}`;
  },

  'F.65': ({state, x}) => {
    // I is set to I + X + 1 after operation according to mattmik, left
    // untouched according to Wikipedia, devernay has no mention of i... :/
    for ( let n = 0; n <= x; n++ )
      state.v[n] = state.ram[state.i + n];
    // state.i += x + 1;
    return `ld v0-v${x}, (i)`;
  }

}
