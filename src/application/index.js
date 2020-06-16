const s       = require('../shared/binary_strings');
const dbgr    = require('../emulator/debugger');
const state   = require('../emulator/state');
const font    = require('../emulator/font');
const timers  = require('../emulator/timers');
const sound   = require('../emulator/sound');
const disasm  = require('../disassembler');
const asm     = require('../assembler');
const compile = require('../compiler');
const editor  = require('codemirror');
require('codemirror/mode/z80/z80.js');
require('codemirror/mode/javascript/javascript.js');
require('codemirror/addon/display/autorefresh.js');

// Initialize CHIPcode editor
const chipcodeEditor = editor(document.querySelector('#chipcode-editor'), {
  value: `/***
 * This is "CHIPcode", a very simple and very crappy C-style high(er) level
 * programming language for CHIP-8!
 * This particular program calculates all primes between 1 and 50.
 */

clear_screen();

byte current = 2;
byte sum = 0;
byte xpos = 1;
byte ypos = 1;
byte div;
byte prime;

// Find primes untill we reach 50
while ( current < 50 ) {

  // Is this a prime number?
  div = 2;
  prime = 1;
  while ( div < current ) {
    // Long form of 'if ( current % div == 0 )', we don't support modulo
    if ( current - (div * (current/div)) == 0 ) {
      prime = 0;
    }
    div = div + 1;
  }

  // If so, then show it
  if ( prime ) {
    print_byte(current, xpos, ypos);
    ypos = ypos + 6;
    if ( ypos > 30 ) {
      ypos = 1;
      xpos = xpos + 20;
    }
  }

  current = current + 1;
}`,
  mode: "javascript",
  lineNumbers: true,
  theme: 'monokai',
  tabSize: 2,
  autoRefresh: true
});

// Initialize assembly editor
const assemblyEditor = editor(document.querySelector('#assembly-editor'), {
  value: `; This is my (z80-based) CHIP-8 assembly dialect.
; This particular program outputs "ABC" on the screen.

  .org $200

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

// Hook up Compile & Run button

document.getElementById('compile').addEventListener('click', e => {
  const program = chipcodeEditor.doc.getValue();
  const errors  = document.getElementById('chipcode-errors');
  let data;

  try {
    data = compile(program);
  } catch(e) {
    errors.innerText = e;
    return;
  }

  errors.innerText = '';
  startProgram(data.binary);
});

// Hook up Assemble & Run button

document.getElementById('assemble').addEventListener('click', e => {
  const program = assemblyEditor.doc.getValue();
  const errors  = document.getElementById('assembly-errors');
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
