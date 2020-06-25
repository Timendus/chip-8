const s         = require('../shared/binary_strings');
const dbgr      = require('../emulator/debugger');
const state     = require('../emulator/state');
const font      = require('../emulator/font');
const timers    = require('../emulator/timers');
const sound     = require('../emulator/sound');
const disasm    = require('../disassembler');
const assembler = require('../assembler');
const compiler  = require('../compiler');
const editor    = require('codemirror');
require('codemirror/mode/z80/z80.js');
require('codemirror/mode/javascript/javascript.js');
require('codemirror/addon/display/autorefresh.js');

// Initialize CHIPcode editor
const chipcodeEditor = editor(document.querySelector('#chipcode-editor'), {
  value: `/***
 * This is "CHIPcode", a very simple and very crappy C-style high(er) level
 * programming language for CHIP-8!
 *
 * This example program calculates prime numbers, as many as fit on the screen
 * at once. It mainly shows off CHIPcode's ability to have nested function calls
 * with parameters and return values, and its ability to do some actual
 * calculations.
 */

clear_screen();
print_primes();

function print_primes() {
  byte current = 2;
  byte max = 20; // Only this many primes fit on the screen
  byte xpos = 0;
  byte ypos = 1;

  while ( max ) {
    // Output only numbers that are prime numbers
    if ( isPrime(current) ) {
      print_byte(current, xpos, ypos);
      max = max - 1;

      // Update screen coordinates
      ypos = ypos + 6;
      if ( ypos > 30 ) {
        ypos = 1;
        xpos = xpos + 15;
      }
    }

    current = current + 1;
  }
}

function isPrime(byte number) {
  byte div = 2;
  while ( div < number ) {
    if ( mod(number, div) == 0 ) {
      return 0;
    }
    div = div + 1;
  }
  return 1;
}

function mod(byte x, byte y) {
  return x - (y * (x/y));
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

function download(filename, contents, binary = false) {
  const newname = prompt('File name:', filename);
  if ( !newname || !contents ) return;
  const anchor = document.createElement('a');
  anchor.download = newname;
  if ( binary ) {
    anchor.href = 'data:application/octet-stream;base64,' + btoa(String.fromCharCode.apply(null, contents))
  } else
    anchor.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents);
  anchor.click();
}

// Hook up compiler buttons

function compile(source) {
  const errors  = document.getElementById('chipcode-errors');
  let data;

  try {
    data = compiler(source);
  } catch(e) {
    errors.innerText = e;
    return null;
  }

  errors.innerText = '';
  return data;
}

document.getElementById('download-chipcode').addEventListener('click', () =>
  download('myProgram.chc', chipcodeEditor.doc.getValue()));

document.getElementById('download-compiled').addEventListener('click', () => {
  const data = compile(chipcodeEditor.doc.getValue());
  download('myProgram.ch8', data.binary, true);
});

document.getElementById('compile').addEventListener('click', e => {
  const data = compile(chipcodeEditor.doc.getValue());
  startProgram(data.binary);
});

// Hook up assembler buttons

function assemble(source) {
  const errors  = document.getElementById('assembly-errors');
  let data;

  try {
    data = assembler(source);
  } catch(e) {
    errors.innerText = e;
    return null;
  }

  errors.innerText = '';
  return data;
}

document.getElementById('download-assembly').addEventListener('click', () =>
  download('myProgram.asm', assemblyEditor.doc.getValue()));

document.getElementById('download-assembled').addEventListener('click', () => {
  const data = assemble(assemblyEditor.doc.getValue());
  download('myProgram.ch8', data, true);
});

document.getElementById('assemble').addEventListener('click', e => {
  const data = assemble(assemblyEditor.doc.getValue());
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
