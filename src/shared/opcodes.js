// Opcodes as documented at:
//   * https://en.wikipedia.org/wiki/CHIP-8
//   * http://mattmik.com/files/chip8/mastering/chip8.html
//   * http://devernay.free.fr/hacks/chip8/C8TECH10.HTM

const e = require('./expressions');
let waitingForKey = false;

module.exports = [

  {
    size:        2,
    bytes:       '00E0',
    instruction: 'cls',
    assemble:    () => [0x00, 0xE0],
    disassemble: () => 'cls',

    run: state => {
      for ( let n = 0x0F00; n <= 0x0FFF; n++ )
        state.ram[n] = 0;
      state.sd = true;
    }
  },

  {
    size:        2,
    bytes:       '00EE',
    instruction: 'ret',
    assemble:    () => [0x00, 0xEE],
    disassemble: () => 'ret',

    run: state => {
      state.sp += 2;
      state.pc = state.ram[state.sp - 0] * 0x100 + state.ram[state.sp - 1];
    }
  },

  {
    size:        0,
    bytes:       `0${e.nnn}`,
    instruction: `rcall ${e.loc}$`,
    assemble:    ([nnn]) => [0x00 | (nnn & 0xF00) / 0x100, nnn & 0xFF],
    disassemble: ([nnn]) => `rcall $0${nnn}`,

    run: (state, [nnn]) => {
      console.error('RCA 1802 Not implemented');
    }
  },

  {
    size:        2,
    bytes:       `1${e.nnn}`,
    instruction: `jp ${e.loc}$`,
    assemble:    ([nnn]) => [0x10 | (nnn & 0xF00) / 0x100, nnn & 0xFF],
    disassemble: ([nnn]) => `jp $0${nnn}`,

    run: (state, [nnn]) => {
      // Step back one instruction because we step ahead later
      state.pc = nnn - 2;
    }
  },

  {
    size:        2,
    bytes:       `2${e.nnn}`,
    instruction: `call ${e.loc}$`,
    assemble:    ([nnn]) => [0x20 | (nnn & 0xF00) / 0x100, nnn & 0xFF],
    disassemble: ([nnn]) => `call $0${nnn}`,

    run: (state, [nnn]) => {
      state.ram[state.sp - 0] = (state.pc & 0xff00) / 0x100;
      state.ram[state.sp - 1] =  state.pc & 0x00ff;
      state.sp -= 2;
      // Step back one instruction because we step ahead later
      state.pc = nnn - 2;
    }
  },

  {
    size:        2,
    bytes:       `3${e.x}${e.nn}`,
    instruction: `se ${e.reg},${e.val}$`,
    assemble:    ([x, nn]) => [0x30 | x & 0xF, nn & 0xFF],
    disassemble: ([x, nn]) => `se v${x}, $${nn}`,

    run: (state, [x, nn]) => {
      if ( state.v[x] === nn ) state.pc += 2;
    }
  },

  {
    size:        2,
    bytes:       `4${e.x}${e.nn}`,
    instruction: `sne ${e.reg},${e.val}$`,
    assemble:    ([x, nn]) => [0x40 | x & 0xF, nn & 0xFF],
    disassemble: ([x, nn]) => `sne v${x}, $${nn}`,

    run: (state, [x, nn]) => {
      if ( state.v[x] !== nn ) state.pc += 2;
    }
  },

  {
    size:        2,
    bytes:       `5${e.x}${e.y}0`,
    instruction: `se ${e.reg},${e.reg}$`,
    assemble:    ([x, y]) => [0x50 | x & 0xF, (y & 0xF) * 0x10],
    disassemble: ([x, y]) => `se v${x}, v${y}`,

    run: (state, [x, y]) => {
      if ( state.v[x] === state.v[y] ) state.pc += 2;
    }
  },

  {
    size:        2,
    bytes:       `6${e.x}${e.nn}`,
    instruction: `ld ${e.reg},${e.val}$`,
    assemble:    ([x, nn]) => [0x60 | x & 0xF, nn & 0xFF],
    disassemble: ([x, nn]) => `ld v${x}, $${nn}`,

    run: (state, [x, nn]) => {
      state.v[x] = nn;
    }
  },

  {
    size:        2,
    bytes:       `7${e.x}${e.nn}`,
    instruction: `add ${e.reg},${e.val}$`,
    assemble:    ([x, nn]) => [0x70 | x & 0xF, nn & 0xFF],
    disassemble: ([x, nn]) => `add v${x}, $${nn}`,

    run: (state, [x, nn]) => {
      state.v[x] += nn;
    }
  },

  {
    size:        2,
    bytes:       `8${e.x}${e.y}0`,
    instruction: `ld ${e.reg},${e.reg}$`,
    assemble:    ([x, y]) => [0x80 | x & 0xF, (y & 0xF) * 0x10],
    disassemble: ([x, y]) => `ld v${x}, v${y}`,

    run: (state, [x, y]) => {
      state.v[x] = state.v[y];
    }
  },

  {
    size:        2,
    bytes:       `8${e.x}${e.y}1`,
    instruction: `^or ${e.reg},${e.reg}$`,
    assemble:    ([x, y]) => [0x80 | x & 0xF, (y & 0xF) * 0x10 | 0x1],
    disassemble: ([x, y]) => `or v${x}, v${y}`,

    run: (state, [x, y]) => {
      state.v[x] |= state.v[y];
    }
  },

  {
    size:        2,
    bytes:       `8${e.x}${e.y}2`,
    instruction: `and ${e.reg},${e.reg}$`,
    assemble:    ([x, y]) => [0x80 | x & 0xF, (y & 0xF) * 0x10 | 0x2],
    disassemble: ([x, y]) => `and v${x}, v${y}`,

    run: (state, [x, y]) => {
      state.v[x] &= state.v[y];
    }
  },

  {
    size:        2,
    bytes:       `8${e.x}${e.y}3`,
    instruction: `xor ${e.reg},${e.reg}$`,
    assemble:    ([x, y]) => [0x80 | x & 0xF, (y & 0xF) * 0x10 | 0x3],
    disassemble: ([x, y]) => `xor v${x}, v${y}`,

    run: (state, [x, y]) => {
      state.v[x] ^= state.v[y];
    }
  },

  {
    size:        2,
    bytes:       `8${e.x}${e.y}4`,
    instruction: `add ${e.reg},${e.reg}$`,
    assemble:    ([x, y]) => [0x80 | x & 0xF, (y & 0xF) * 0x10 | 0x4],
    disassemble: ([x, y]) => `add v${x}, v${y}`,

    run: (state, [x, y]) => {
      // Set VF to 01 if a carry occurs
      // Set VF to 00 if a carry does not occur
      state.v[0xF] = (state.v[x] + state.v[y]) > 0xFF ? 1 : 0;
      state.v[x]  += state.v[y];
    }
  },

  {
    size:        2,
    bytes:       `8${e.x}${e.y}5`,
    instruction: `sub ${e.reg},${e.reg}$`,
    assemble:    ([x, y]) => [0x80 | x & 0xF, (y & 0xF) * 0x10 | 0x5],
    disassemble: ([x, y]) => `sub v${x}, v${y}`,

    run: (state, [x, y]) => {
      // Set VF to 00 if a borrow occurs
      // Set VF to 01 if a borrow does not occur
      state.v[0xF] = state.v[y] > state.v[x] ? 0 : 1;
      state.v[x]  -= state.v[y];
    }
  },

  {
    size:        2,
    bytes:       `8${e.x}${e.y}6`,
    instruction: `shr ${e.reg}$`,
    assemble:    ([x, y]) => [0x80 | x & 0xF, (y & 0xF) * 0x10 | 0x6],
    disassemble: ([x, y]) => `shr v${x}, v${y}`,

    run: (state, [x, y]) => {
      // Set register VF to the least significant bit prior to the shift
      state.v[0xF] = state.v[y] & 0b00000001 ? 1 : 0;
      state.v[x]   = state.v[y] >> 1;
    }
  },

  {
    size:        2,
    bytes:       `8${e.x}${e.y}7`,
    instruction: `subn ${e.reg},${e.reg}$`,
    assemble:    ([x, y]) => [0x80 | x & 0xF, (y & 0xF) * 0x10 | 0x7],
    disassemble: ([x, y]) => `subn v${x}, v${y}`,

    run: (state, [x, y]) => {
      // Set VF to 00 if a borrow occurs
      // Set VF to 01 if a borrow does not occur
      state.v[0xF] = state.v[x] > state.v[y] ? 0 : 1;
      state.v[x]   = state.v[y] - state.v[x];
    }
  },

  {
    size:        2,
    bytes:       `8${e.x}${e.y}E`,
    instruction: `shl ${e.reg},${e.reg}$`,
    assemble:    ([x, y]) => [0x80 | x & 0xF, (y & 0xF) * 0x10 | 0xE],
    disassemble: ([x, y]) => `shl v${x}, v${y}`,

    run: (state, [x, y]) => {
      // Set register VF to the most significant bit prior to the shift
      state.v[0xF] = state.v[y] & 0b10000000 ? 1 : 0;
      state.v[x]   = state.v[y] << 1;
    }
  },

  {
    size:        2,
    bytes:       `9${e.x}${e.y}0`,
    instruction: `sne ${e.reg},${e.reg}$`,
    assemble:    ([x, y]) => [0x90 | x & 0xF, (y & 0xF) * 0x10],
    disassemble: ([x, y]) => `sne v${x}, v${y}`,

    run: (state, [x, y]) => {
      if ( state.v[x] !== state.v[y] ) state.pc += 2;
    }
  },

  {
    size:        2,
    bytes:       `A${e.nnn}`,
    instruction: `ld i,${e.loc}$`,
    assemble:    ([nnn]) => [0xA0 | (nnn & 0xF00) / 0x100, nnn & 0xFF],
    disassemble: ([nnn]) => `ld i, $0${nnn}`,

    run: (state, [nnn]) => {
      state.i = nnn;
    }
  },

  {
    size:        2,
    bytes:       `B${e.nnn}`,
    instruction: `jp v0,${e.loc}$`,
    assemble:    ([nnn]) => [0xB0 | (nnn & 0xF00) / 0x100, nnn & 0xFF],
    disassemble: ([nnn]) => `jp v0, $0${nnn}`,

    run: (state, [nnn]) => {
      state.pc = nnn + state.v[0] - 2; // Step back one instruction because we step ahead later
    }
  },

  {
    size:        2,
    bytes:       `C${e.x}${e.nn}`,
    instruction: `rand ${e.reg},${e.val}$`,
    assemble:    ([x, nn]) => [0xC0 | x & 0xF, nn & 0xFF],
    disassemble: ([x, nn]) => `rand v${x}, $${nn}`,

    run: (state, [x, nn]) => {
      state.v[x] = Math.floor(Math.random() * 0x100) & nn;
    }
  },

  {
    size:        2,
    bytes:       `D${e.x}${e.y}${e.n}`,
    instruction: `drw ${e.reg},${e.reg},${e.val}$`,
    assemble:    ([x, y, n]) => [0xD0 | x & 0xF, (y & 0xF) * 0x10 | n & 0xF],
    disassemble: ([x, y, n]) => `drw v${x}, v${y}, $${n}`,

    run: (state, [x, y, n]) => {
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
    }
  },

  {
    size:        2,
    bytes:       `E${e.x}9E`,
    instruction: `skp ${e.reg}$`,
    assemble:    ([x]) => [0xE0 | x & 0xF, 0x9E],
    disassemble: ([x]) => `skp v${x}`,

    run: (state, [x], keyboard) => {
      if ( keyboard.pressed(state.v[x]) )
        state.pc += 2;
    }
  },

  {
    size:        2,
    bytes:       `E${e.x}A1`,
    instruction: `sknp ${e.reg}$`,
    assemble:    ([x]) => [0xE0 | x & 0xF, 0xA1],
    disassemble: ([x]) => `sknp v${x}`,

    run: (state, [x], keyboard) => {
      if ( !keyboard.pressed(state.v[x]) )
        state.pc += 2;
    }
  },

  {
    size:        2,
    bytes:       `F${e.x}07`,
    instruction: `ld ${e.reg},\\s?dt$`,
    assemble:    ([x]) => [0xF0 | x & 0xF, 0x07],
    disassemble: ([x]) => `ld v${x}, dt`,

    run: (state, [x]) => {
      state.v[x] = state.delay;
    }
  },

  {
    size:        2,
    bytes:       `F${e.x}0A`,
    instruction: `getkey ${e.reg}$`,
    assemble:    ([x]) => [0xF0 | x & 0xF, 0x0A],
    disassemble: ([x]) => `getkey v${x}`,

    run: (state, [x], keyboard) => {
      const keyPressed = keyboard.anyPressed();

      // First, wait for key release if any key is pressed
      if ( !waitingForKey ) {
        state.pc -= 2; // Stay on current instruction
        if ( !keyPressed )
          waitingForKey = true;

      // Then, wait for key press
      } else {
        if ( !keyPressed )
          state.pc -= 2; // Stay on current instruction
        else {
          waitingForKey = false;
          state.v[x] = keyPressed;
        }
      }
    }
  },

  {
    size:        2,
    bytes:       `F${e.x}15`,
    instruction: `ld dt,${e.reg}$`,
    assemble:    ([x]) => [0xF0 | x & 0xF, 0x15],
    disassemble: ([x]) => `ld dt, v${x}`,

    run: (state, [x]) => {
      state.delay = state.v[x];
    }
  },

  {
    size:        2,
    bytes:       `F${e.x}18`,
    instruction: `ld st,${e.reg}$`,
    assemble:    ([x]) => [0xF0 | x & 0xF, 0x18],
    disassemble: ([x]) => `ld st, v${x}`,

    run: (state, [x]) => {
      state.sound = state.v[x];
    }
  },

  {
    size:        2,
    bytes:       `F${e.x}1E`,
    instruction: `add i,${e.reg}$`,
    assemble:    ([x]) => [0xF0 | x & 0xF, 0x1E],
    disassemble: ([x]) => `add i, v${x}`,

    run: (state, [x]) => {
      // Overflow stored in VF according to Wikipedia, not
      // according to both other sources... :/
      // state.v[0xF] = (state.i + state.v[x]) > 0xFFF ? 1 : 0;
      state.i = (state.i + state.v[x]) & 0xFFF;
    }
  },

  {
    size:        2,
    bytes:       `F${e.x}29`,
    instruction: `getfont ${e.reg}$`,
    assemble:    ([x]) => [0xF0 | x & 0xF, 0x29],
    disassemble: ([x]) => `getfont v${x}`,

    run: (state, [x]) => {
      // Font is stored in first part of memory,
      // each character is 5 bytes, so:
      state.i = state.v[x] * 5;
    }
  },

  {
    size:        2,
    bytes:       `F${e.x}33`,
    instruction: `bcd \\(i\\),${e.reg}$`,
    assemble:    ([x]) => [0xF0 | x & 0xF, 0x33],
    disassemble: ([x]) => `bcd (i), v${x}`,

    run: (state, [x]) => {
      state.ram[state.i + 0] = state.v[x] / 100;
      state.ram[state.i + 1] = state.v[x] % 100 / 10;
      state.ram[state.i + 2] = state.v[x] % 10;
    }
  },

  {
    size:        2,
    bytes:       `F${e.x}55`,
    instruction: `ld \\(i\\),\\s?(?:v0\\-)${e.reg}$`,
    assemble:    ([x]) => [0xF0 | x & 0xF, 0x55],
    disassemble: ([x]) => `ld (i), v${x}`,

    run: (state, [x]) => {
      // I is set to I + X + 1 after operation according to mattmik, left
      // untouched according to Wikipedia, devernay has no mention of i... :/
      for ( let n = 0; n <= x; n++ )
        state.ram[state.i + n] = state.v[n];
    }
  },

  {
    size:        2,
    bytes:       `F${e.x}65`,
    instruction: `ld (?:v0\\-)${e.reg},\\s?\\(i\\)$`,
    assemble:    ([x]) => [0xF0 | x & 0xF, 0x65],
    disassemble: ([x]) => `ld v${x}, (i)`,

    run: (state, [x]) => {
      // I is set to I + X + 1 after operation according to mattmik, left
      // untouched according to Wikipedia, devernay has no mention of i... :/
      for ( let n = 0; n <= x; n++ )
        state.v[n] = state.ram[state.i + n];
    }
  }

]
