const s        = require('../shared/binary_strings');
const opcodes  = require('../shared/opcodes');
const display  = require('./display');
const keyboard = require('./keyboard');

module.exports = {
  new: () => ({
    pc:  0x0200,                // Program counter
    sp:  0x0EFF,                // Stack pointer
    i:   0x0000,                // Index register
    v:   new Uint8Array(16),    // Other registers
    ram: new Uint8Array(4096),  // Memory
    sd:  false,                 // Screen dirty
    delay: 0,                   // Delay timer
    sound: 0,                   // Sound timer

    debugging: {
      debugger: false,
      opcodes:  false
    }
  }),

  tenSteps: async state => {
    for ( let i = 0; i < 10; i++ ) await step(state);
  },

  step
}

async function step(state) {
  const highByte = state.ram[state.pc];
  const lowByte  = state.ram[state.pc+1];
  const opcode   = s.bin2str([highByte, lowByte], '').toUpperCase();
  const old_pc   = state.pc;

  const interpretation = opcodes.find(o => opcode.match(o.bytes));

  if ( interpretation ) {
    interpretation.run(
      state,
      opcode.match(interpretation.bytes)
            .splice(1)
            .map(hex => parseInt(hex, 16)),
      keyboard
    );

    if ( state.debugging.opcodes )
      console.log(`${s.word2str(old_pc)}:\t${opcode}\t${interpretation.disassemble(parameters)}\n`);
  } else {
    console.error(`${s.word2str(old_pc)}:\t${opcode}\tUNKNOWN INSTRUCTION\n`);
  }

  // Render display if dirty
  if ( state.sd ) {
    display.render(state);
    state.sd = false;
  }

  // Go to next instruction
  state.pc += 2;
}
