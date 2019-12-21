const s    = require('./binary_strings');
const dbgr = document.getElementById('debugger');

module.exports = {
  render: state => {
    if ( state.debugging.debugger )
      dbgr.innerText = `
PC: ${s.word2str(state.pc)}      SP: ${s.word2str(state.sp)}

 I: ${s.word2str(state.i)}       V: ${s.bin2str(state.v)}

RAM:
${s.bin2str(state.ram)}`;
  }
}
