const s      = require('./binary_strings');
const dbgr   = require('./debugger');
const state  = require('./state');
const font   = require('./font');
const timers = require('./timers');
const sound  = require('./sound');
const disasm = require('./disassembler');

let currentState;
let playing = true;
const debugging = {
  debugger: false,
  opcodes:  false
};

// Hook up controls under the "device"

document.getElementById('upload').addEventListener('change', e => {
  const reader = new FileReader();
  reader.addEventListener('load', e => startProgram(new Uint8Array(reader.result)));
  reader.readAsArrayBuffer(e.target.files[0]);
});

document.getElementById('play').addEventListener('click', () => {
  playing = !playing;
  if ( playing ) requestAnimationFrame(run);
  document.getElementById('play').innerText = playing ? 'Pause' : 'Play';
  document.getElementById('step').disabled = playing;
});

document.getElementById('step').addEventListener('click', () => {
  state.step(currentState);
  dbgr.render(currentState);
});

document.getElementById('show_dbg').addEventListener('click', () => {
  debugging.debugger = !debugging.debugger;
  if ( currentState )
    currentState.debugging = debugging;
  document.getElementById('show_dbg').classList.toggle('active');
  if ( !debugging.debugger )
    document.getElementById('debugger').innerText = '';
});

document.getElementById('show_opc').addEventListener('click', () => {
  debugging.opcodes = !debugging.opcodes;
  if ( currentState )
    currentState.debugging = debugging;
  document.getElementById('show_opc').classList.toggle('active');
});

// Load and run program

function startProgram(program) {
  currentState = state.new();
  currentState.debugging = debugging;
  font.load(currentState);
  timers.connect(currentState);
  sound.connect(currentState);

  console.info(`Program read from disk:\n\n${disasm.disassemble(program)}\n\nLoading into RAM...`);

  writePointer = 0x200;
  for ( let byte of program ) {
    currentState.ram[writePointer] = byte;
    writePointer++;
  }

  console.info(`Starting program...`);

  if ( playing ) requestAnimationFrame(run);
}

function run() {
  state.step(currentState)
  .then(() => {
    dbgr.render(currentState);
    if ( playing ) requestAnimationFrame(run);
  });
}
