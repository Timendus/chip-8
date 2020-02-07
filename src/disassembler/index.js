const s       = require('../shared/binary_strings');
const opcodes = require('../shared/opcodes');

module.exports = (binary, options) => {

  let output = '';

  for ( let pc = 0; pc < binary.length; pc += 2 ) {
    const highByte  = binary[pc];
    const lowByte   = binary[pc+1];
    const opcode    = s.bin2str([highByte, lowByte], '').toUpperCase();

    // Which opcode do these bytes match with?
    const interpretation = opcodes.find(o => opcode.match(o.bytes));

    let instruction;
    if ( interpretation ) {
      const parameters = opcode.match(interpretation.bytes).splice(1);
      instruction = interpretation.disassemble(parameters);
    } else {
      instruction = "UNKNOWN INSTRUCTION";
    }

    output += `${s.word2str(0x200 + pc)}:\t${opcode}\t${instruction}\n`;
  }

  return output;

}
