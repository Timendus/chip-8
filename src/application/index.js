const s      = require('../shared/binary_strings');
const dbgr   = require('../emulator/debugger');
const state  = require('../emulator/state');
const font   = require('../emulator/font');
const timers = require('../emulator/timers');
const sound  = require('../emulator/sound');
const disasm = require('../disassembler');
const asm    = require('../assembler');
const editor = require('codemirror');
require('codemirror/mode/z80/z80.js');
require('codemirror/addon/display/autorefresh.js');

// Initialize code editor
const codeEditor = editor(document.querySelector('#editor'), {
  value: `.org $200

  ; Setup
  cls
  ld v1, 25     ; X coord

  ld v0, $A     ; Draw A
  call drawChar

  ld v0, $B     ; Draw B
  call drawChar

  ld v0, $C     ; Draw C
  call drawChar

endlessLoop:
  jp endlessLoop

drawChar:
  ld v2, 12     ; Y coord
  getfont v0
  drw v1, v2, 5
  add v1, 5
  ret`,
  mode: "z80",
  lineNumbers: true,
  theme: 'monokai',
  tabSize: 2,
  autoRefresh: true
});

// Initialize disassembly viewer
const disasmViewer = editor(document.querySelector('#disassembler'), {
  value: '',
  mode: "z80",
  theme: 'monokai',
  tabSize: 2,
  editable: false,
  autoRefresh: true
});

let currentState;
let currentProgram;
let playing = true;

const debugging = {
  debugger: true,
  opcodes:  false
};

// Hook up tabs

document.querySelectorAll('ul.tabs li').forEach(t => {
  t.addEventListener('click', e => {
    // Remove active class
    document.querySelectorAll('ul.tabs li, .tab-panel .tab-pane').forEach(p => {
      p.classList.remove('active');
    });
    // Set active class where needed
    e.target.classList.add('active');
    document.querySelector(e.target.getAttribute('data-target')).classList.add('active');
  });
});

// Hook up Assemble & Run button

document.getElementById('run').addEventListener('click', e => {
  const program = codeEditor.doc.getValue();
  const errors  = document.getElementById('errors');
  let data;

  try {
    data = asm(program);
  } catch(e) {
    errors.innerText = e;
    return;
  }

  errors.innerText = '';
  startProgram(data);
});

// Hook up controls under the "device"

document.getElementById('upload').addEventListener('change', e => {
  if ( e.target.files.length == 0 ) return;
  const reader = new FileReader();
  reader.addEventListener('load', e => startProgram(new Uint8Array(reader.result)));
  reader.readAsArrayBuffer(e.target.files[0]);
});

document.getElementById('play').addEventListener('click', () => {
  playing = !playing;
  if ( playing )
    run();
  else
    stop();
  document.getElementById('play').innerText = playing ? 'Pause' : 'Play';
  document.getElementById('step').disabled = playing;
});

document.getElementById('step').addEventListener('click', () => {
  state.step(currentState);
  dbgr.render(currentState);
});

document.getElementById('reset').addEventListener('click', () => {
  startProgram(currentProgram);
});

document.getElementById('show_opc').addEventListener('click', () => {
  debugging.opcodes = !debugging.opcodes;
  if ( currentState )
    currentState.debugging = debugging;
  document.getElementById('show_opc').classList.toggle('active');
});

// Load and run program

function startProgram(program) {
  // Unload old program
  if ( currentState ) {
    stop();
    timers.disconnect(currentState);
    sound.disconnect(currentState);
  }

  // Load new program
  currentProgram = program;
  currentState = state.new();
  currentState.debugging = debugging;
  font.load(currentState);
  timers.connect(currentState);
  sound.connect(currentState);

  console.info(`Program read from disk:\n\n${disasm(program)}\n\nLoading into RAM...`);
  disasmViewer.doc.setValue(disasm(program));

  writePointer = 0x200;
  for ( let byte of program ) {
    currentState.ram[writePointer] = byte;
    writePointer++;
  }

  console.info(`Starting program...`);

  if ( playing ) run();
}

function run() {
  currentState.tickInterval = setInterval(() => {
    state.tenSteps(currentState);
    dbgr.render(currentState);
  }, 17);
}

function stop() {
  if ( currentState && currentState.tickInterval )
    clearInterval(currentState.tickInterval);
}
