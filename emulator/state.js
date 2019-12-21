const s       = require('./binary_strings');
const opcodes = require('./opcodes');
const display = require('./display');

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
  const highByte  = state.ram[state.pc];
  const lowByte   = state.ram[state.pc+1];
  const opcode    = s.bin2str([highByte, lowByte], '');
  const old_pc    = state.pc;
  let instruction = "UNKNOWN INSTRUCTION";

  // Look up and execute opcode
  for ( let match in opcodes ) {
    if ( opcode.match(new RegExp(match, 'i')) ) {
      instruction = await opcodes[match]({
        highByte,
        lowByte,
        state,

        nnn: (highByte & 0b00001111) * 0x100 + lowByte,
        nn:  lowByte,
        n:   lowByte  & 0b00001111,
        x:   highByte & 0b00001111,
        y:   (lowByte & 0b11110000) >> 4
      });
      break;
    }
  }

  // Render display if dirty
  if ( state.sd ) {
    display.render(state);
    state.sd = false;
  }

  // Render output if needed/requested
  const output = `${s.word2str(old_pc)}:\t${opcode}\t${instruction}\n`;
  if ( instruction == "UNKNOWN INSTRUCTION" )
    console.error(output);
  else if ( state.debugging.opcodes )
    console.info(output);

  // Go to next instruction
  state.pc += 2;
}
