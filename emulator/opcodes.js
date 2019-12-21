const s = require('./binary_strings');
const keyboard = require('./keyboard');

module.exports = {

  '00E0': ({state}) => {
    for ( let n = 0x0F00; n <= 0x0FFF; n++ ) state.ram[n] = 0;
    state.sd = true;
    return 'CLEAR';
  },

  '00EE': ({state, disassemble}) => {
    if ( disassemble )
      return 'RETURN';

    state.sp += 2;
    state.pc = state.ram[state.sp - 0] + state.ram[state.sp - 1] * 0x100;
    return `RETURN ${s.word2str(state.pc)}`;
  },

  '0...': () => console.error('RCA 1802 Not implemented'),

  '1...': ({state, nnn}) => {
    state.pc = nnn - 2; // Step back one instruction because we step ahead later
    return `JUMP ${s.word2str(nnn)}`;
  },

  '2...': ({state, nnn}) => {
    state.ram[state.sp - 0] =  state.pc & 0x00ff;
    state.ram[state.sp - 1] = (state.pc & 0xff00) / 0x100;
    state.sp -= 2;
    state.pc = nnn - 2; // Step back one instruction because we step ahead later
    return `CALL ${s.word2str(nnn)}`;
  },

  '3...': ({state, x, nn}) => {
    if ( state.v[x] === nn ) state.pc += 2;
    return `SKIP_IF_EQUAL_TO V${x}, ${s.byte2str(nn)}`;
  },

  '4...': ({state, x, nn}) => {
    if ( state.v[x] !== nn ) state.pc += 2;
    return `SKIP_IF_UNEQUAL_TO V${x}, ${s.byte2str(nn)}`;
  },

  '5..0': ({state, x, y}) => {
    if ( state.v[x] === state.v[y] ) state.pc += 2;
    return `SKIP_IF_SAME V${x}, V${y}`;
  },

  '6...': ({state, x, nn}) => {
    state.v[x] = nn;
    return `LOAD V${x}, ${s.byte2str(nn)}`;
  },

  '7...': ({state, x, nn}) => {
    state.v[x] += nn;
    return `ADD_VALUE V${x}, ${s.byte2str(nn)}`;
  },

  '8..0': ({state, x, y}) => {
    state.v[x] = state.v[y];
    return `ASSIGN V${x}, V${y}`;
  },

  '8..1': ({state, x, y}) => {
    state.v[x] |= state.v[y];
    return `OR V${x}, V${y}`;
  },

  '8..2': ({state, x, y}) => {
    state.v[x] &= state.v[y];
    return `AND V${x}, V${y}`;
  },

  '8..3': ({state, x, y}) => {
    state.v[x] ^= state.v[y];
    return `XOR V${x}, V${y}`;
  },

  '8..4': ({state, x, y}) => {
    state.v[x] += state.v[y];
    state.v[0xF] = state.v[x] + state.v[y] > 255 ? 1 : 0;
    return `ADD V${x}, V${y}`;
  },

  '8..5': ({state, x, y}) => {
    state.v[x] -= state.v[y];
    state.v[0xF] = state.v[x] >= state.v[y] ? 1 : 0;
    return `SUB V${x}, V${y}`;
  },

  '8..6': ({state, x}) => {
    state.v[0xF] = state.v[x] & 0b00000001 ? 1 : 0;
    state.v[x]   = state.v[x] >> 1;
    return `SHIFT_RIGHT V${x}`;
  },

  '8..7': ({state, x, y}) => {
    state.v[x] = state.v[y] - state.v[x];
    state.v[0xF] = state.v[y] >= state.v[x] ? 1 : 0;
    return `SUB_INVERSE V${x}, V${y}`;
  },

  '8..E': ({state, x}) => {
    state.v[0xF] = state.v[x] & 0b10000000 ? 1 : 0;
    state.v[x]   = state.v[x] << 1;
    return `SHIFT_LEFT V${x}`;
  },

  '9..0': ({state, x, y}) => {
    if ( state.v[x] !== state.v[y] ) state.pc += 2;
    return `SKIP_IF_UNEQUAL V${x}, V${y}`;
  },

  'A...': ({state, nnn}) => {
    state.i = nnn;
    return `SET_I ${s.word2str(nnn)}`;
  },

  'B...': ({state, nnn}) => {
    state.pc = nnn + state.v[0] - 2; // Step back one instruction because we step ahead later
    return `JUMP V0 + ${s.word2str(nnn)}`;
  },

  'C...': ({state, x, nn}) => {
    state.v[x] = Math.floor(Math.random() * 255) & nn;
    return `RAND V${x}, ${s.byte2str(nn)}`;
  },

  'D...': ({state, x, y, n}) => {
    const xPos = state.v[x];
    const yPos = state.v[y];

    const memoryOffset = Math.floor(yPos * 8 + xPos / 8);
    let flipped = false;

    for ( let i = 0; i < n; i++ ) {
      const spritePart = state.ram[state.i + i];

      flipped = !!(state.ram[0x0F00 + memoryOffset + i * 8 + 0] & spritePart >> (xPos % 8)) ||
                !!(state.ram[0x0F00 + memoryOffset + i * 8 + 1] & spritePart << (8 - (xPos % 8)) & 0xFF);

      state.ram[0x0F00 + memoryOffset + i * 8 + 0] ^= spritePart >> (xPos % 8);
      state.ram[0x0F00 + memoryOffset + i * 8 + 1] ^= spritePart << (8 - (xPos % 8)) & 0xFF;
    }
    state.sd = true;
    state.v[0xF] = flipped ? 1 : 0;

    return `DRAW ${xPos}, ${yPos}, ${n}, ${s.word2str(state.i)}`;
  },

  'E.9E': ({state, x}) => {
    if ( keyboard.pressed(state.v[x]) ) state.pc += 2;
    return `SKIP_IF_KEYPRESS V${x}`;
  },

  'E.A1': ({state, x}) => {
    if ( !keyboard.pressed(state.v[x]) ) state.pc += 2;
    return `SKIP_UNLESS_KEYPRESS V${x}`;
  },

  'F.07': ({state, x}) => {
    state.v[x] = state.delay;
    return `GET_DELAY V${x}`;
  },

  'F.0A': ({state, x, disassemble}) => {
    if ( disassemble )
      return `GET_KEY V${x}`;

    return keyboard.waitPress()
                   .then(key => {
                     state.v[x] = key;
                     return `GET_KEY V${x}`;
                   });
  },

  'F.15': ({state, x}) => {
    state.delay = state.v[x];
    return `SET_DELAY V${x}`;
  },

  'F.18': ({state, x}) => {
    state.sound = state.v[x];
    return `SET_SOUND V${x}`;
  },

  'F.1E': ({state, x}) => {
    const newValue = state.i + state.v[x];
    state.v[0xF] = newValue > 0xFFF ? 1 : 0;
    state.i = newValue & 0xFFF;
    return `ADD_TO_I V${x}`;
  },

  'F.29': ({state, x}) => {
    state.i = state.v[x] * 5;
    return `LOAD_FONT V${x}`;
  },

  'F.33': ({state, x}) => {
    state.ram[state.i + 0] = state.v[x] % 1000 / 100;
    state.ram[state.i + 1] = state.v[x] % 100 / 10;
    state.ram[state.i + 2] = state.v[x] % 10;
    return `STORE_BCD V${x}`;
  },

  'F.55': ({state, x}) => {
    for ( let n = 0; n <= x; n++ )
      state.ram[state.i + n] = state.v[n];
    return `SAVE_REGISTERS V0 - V${x}`;
  },

  'F.65': ({state, x}) => {
    for ( let n = 0; n <= x; n++ )
      state.v[n] = state.ram[state.i + n];
    return `LOAD_REGISTERS V0 - V${x}`;
  }

}
