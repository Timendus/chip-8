const s      = require('../shared/binary_strings');
const dbgr   = require('../emulator/debugger');
const state  = require('../emulator/state');
const font   = require('../emulator/font');
const timers = require('../emulator/timers');
const sound  = require('../emulator/sound');
const disasm = require('../emulator/disassembler');
const asm    = require('../assembler');
const editor = require('codemirror');
require('codemirror/mode/z80/z80.js');

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
  tabSize: 2
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

document.getElementById('run').addEventListener('click', e => {
  const program = codeEditor.doc.getValue();
  const data    = asm(program);
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
  if ( playing ) requestAnimationFrame(run);
  document.getElementById('play').innerText = playing ? 'Pause' : 'Play';
  document.getElementById('step').disabled = playing;
});

document.getElementById('step').addEventListener('click', () => {
  state.step(currentState)
       .then(() => dbgr.render(currentState));
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
  currentProgram = program;
  currentState = state.new();
  currentState.debugging = debugging;
  font.load(currentState);
  timers.connect(currentState);
  sound.connect(currentState);

  console.info(`Program read from disk:\n\n${disasm.disassemble(program)}\n\nLoading into RAM...`);

  // Output disassembled program to disassembly editor
  const codeEditor = editor(document.querySelector('#disassembler'), {
    value: disasm.disassemble(program),
    mode: "z80",
    theme: 'monokai',
    tabSize: 2,
    editable: false
  });

  writePointer = 0x200;
  for ( let byte of program ) {
    currentState.ram[writePointer] = byte;
    writePointer++;
  }

  console.info(`Starting program...`);

  if ( playing ) run();
}

function run() {
  if ( playing )
    setTimeout(() => {
      state.tenSteps(currentState)
      .then(() => {
        dbgr.render(currentState);
        run();
      });
    }, 17);
}
