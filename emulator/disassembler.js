const s       = require('./binary_strings');
const opcodes = require('./opcodes');
const state   = require('./state');

module.exports = {
  disassemble: file => {
    const currentState = state.new();
    let output = '';

    for ( let pc = 0; pc < file.length; pc += 2 ) {
      const highByte  = file[pc];
      const lowByte   = file[pc+1];
      const opcode    = s.bin2str([highByte, lowByte], '');
      let instruction = "UNKNOWN INSTRUCTION";

      // Look up opcode
      for ( let match in opcodes ) {
        if ( opcode.match(new RegExp(match, 'i')) ) {
          instruction = opcodes[match]({
            disassemble: true,
            state: currentState,
            highByte,
            lowByte,

            nnn: (highByte & 0b00001111) * 0x100 + lowByte,
            nn:  lowByte,
            n:   lowByte  & 0b00001111,
            x:   highByte & 0b00001111,
            y:   (lowByte & 0b11110000) >> 4
          });
          break;
        }
      }

      output += `${s.word2str(0x200 + pc)}:\t${opcode}\t${instruction}\n`;
    }

    return output;
  }
}
