/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./emulator/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./emulator/binary_strings.js":
/*!************************************!*\
  !*** ./emulator/binary_strings.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function bin2str(bin, join = ' ') {\n  return Array.from(bin)\n              .map(b => byte2str(b))\n              .join(join);\n}\n\nfunction byte2str(byte) {\n  return parseInt(byte, 10).toString(16).padStart(2, \"0\");\n}\n\nfunction word2str(word) {\n  return bin2str([(word & 0xFF00) / 0x100, word & 0x00FF]);\n}\n\nmodule.exports = {\n  bin2str, byte2str, word2str\n}\n\n\n//# sourceURL=webpack:///./emulator/binary_strings.js?");

/***/ }),

/***/ "./emulator/debugger.js":
/*!******************************!*\
  !*** ./emulator/debugger.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const s    = __webpack_require__(/*! ./binary_strings */ \"./emulator/binary_strings.js\");\nconst dbgr = document.getElementById('debugger');\n\nmodule.exports = {\n  render: state => {\n    if ( state.debugging.debugger )\n      dbgr.innerText = `\nPC: ${s.word2str(state.pc)}      SP: ${s.word2str(state.sp)}\n\n I: ${s.word2str(state.i)}       V: ${s.bin2str(state.v)}\n\nRAM:\n${s.bin2str(state.ram)}`;\n  }\n}\n\n\n//# sourceURL=webpack:///./emulator/debugger.js?");

/***/ }),

/***/ "./emulator/disassembler.js":
/*!**********************************!*\
  !*** ./emulator/disassembler.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const s       = __webpack_require__(/*! ./binary_strings */ \"./emulator/binary_strings.js\");\nconst opcodes = __webpack_require__(/*! ./opcodes */ \"./emulator/opcodes.js\");\nconst state   = __webpack_require__(/*! ./state */ \"./emulator/state.js\");\n\nmodule.exports = {\n  disassemble: file => {\n    const currentState = state.new();\n    let output = '';\n\n    for ( let pc = 0; pc < file.length; pc += 2 ) {\n      const highByte  = file[pc];\n      const lowByte   = file[pc+1];\n      const opcode    = s.bin2str([highByte, lowByte], '');\n      let instruction = \"UNKNOWN INSTRUCTION\";\n\n      // Look up opcode\n      for ( let match in opcodes ) {\n        if ( opcode.match(new RegExp(match, 'i')) ) {\n          instruction = opcodes[match]({\n            disassemble: true,\n            state: currentState,\n            highByte,\n            lowByte,\n\n            nnn: (highByte & 0b00001111) * 0x100 + lowByte,\n            nn:  lowByte,\n            n:   lowByte  & 0b00001111,\n            x:   highByte & 0b00001111,\n            y:   (lowByte & 0b11110000) >> 4\n          });\n          break;\n        }\n      }\n\n      output += `${s.word2str(0x200 + pc)}:\\t${opcode}\\t${instruction}\\n`;\n    }\n\n    return output;\n  }\n}\n\n\n//# sourceURL=webpack:///./emulator/disassembler.js?");

/***/ }),

/***/ "./emulator/display.js":
/*!*****************************!*\
  !*** ./emulator/display.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("const canvas  = document.getElementById('display');\nconst display = canvas.getContext('2d');\n\ncanvas.width = 64;\ncanvas.height = 32;\n\nmodule.exports = {\n  render: state => {\n    const imageData = display.createImageData(64, 32);\n    for ( let y = 0; y < 32; y++ ) {\n      for ( let x = 0; x < 64; x++ ) {\n        const memoryOffset  = Math.floor(y * 64 / 8 + x / 8);\n        const pixelOffset   = x % 8;\n        const displayOffset = y * 64 * 4 + x * 4;\n        imageData.data[displayOffset+0] = state.ram[0x0F00 + memoryOffset] & (0b10000000 >> pixelOffset) ? 0x55 : 0xCC;\n        imageData.data[displayOffset+1] = state.ram[0x0F00 + memoryOffset] & (0b10000000 >> pixelOffset) ? 0x55 : 0xCC;\n        imageData.data[displayOffset+2] = state.ram[0x0F00 + memoryOffset] & (0b10000000 >> pixelOffset) ? 0x55 : 0xCC;\n        imageData.data[displayOffset+3] = 0xFF;\n      }\n    }\n    display.putImageData(imageData, 0, 0);\n  }\n}\n\n\n//# sourceURL=webpack:///./emulator/display.js?");

/***/ }),

/***/ "./emulator/font.js":
/*!**************************!*\
  !*** ./emulator/font.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("const font = fontArray();\n\nmodule.exports = {\n  load: state => {\n    for ( let i = 0; i < font.length; i++ )\n      state.ram[i] = font[i];\n  }\n}\n\nfunction fontArray() {\n  return new Uint8Array([\n    0b11110000,\n    0b10010000,\n    0b10010000,\n    0b10010000,\n    0b11110000,\n\n    0b00100000,\n    0b01100000,\n    0b00100000,\n    0b00100000,\n    0b01110000,\n\n    0b11110000,\n    0b00010000,\n    0b11110000,\n    0b10000000,\n    0b11110000,\n\n    0b11110000,\n    0b00010000,\n    0b11110000,\n    0b00010000,\n    0b11110000,\n\n    0b10010000,\n    0b10010000,\n    0b11110000,\n    0b00010000,\n    0b00010000,\n\n    0b11110000,\n    0b10000000,\n    0b11110000,\n    0b00010000,\n    0b11110000,\n\n    0b11110000,\n    0b10000000,\n    0b11110000,\n    0b10010000,\n    0b11110000,\n\n    0b11110000,\n    0b00010000,\n    0b00100000,\n    0b01000000,\n    0b01000000,\n\n    0b11110000,\n    0b10010000,\n    0b11110000,\n    0b10010000,\n    0b11110000,\n\n    0b11110000,\n    0b10010000,\n    0b11110000,\n    0b00010000,\n    0b11110000,\n\n    0b11110000,\n    0b10010000,\n    0b11110000,\n    0b10010000,\n    0b10010000,\n\n    0b11100000,\n    0b10010000,\n    0b11100000,\n    0b10010000,\n    0b11100000,\n\n    0b11110000,\n    0b10000000,\n    0b10000000,\n    0b10000000,\n    0b11110000,\n\n    0b11100000,\n    0b10010000,\n    0b10010000,\n    0b10010000,\n    0b11100000,\n\n    0b11110000,\n    0b10000000,\n    0b11110000,\n    0b10000000,\n    0b11110000,\n\n    0b11110000,\n    0b10000000,\n    0b11110000,\n    0b10000000,\n    0b10000000,\n  ]);\n}\n\n\n//# sourceURL=webpack:///./emulator/font.js?");

/***/ }),

/***/ "./emulator/index.js":
/*!***************************!*\
  !*** ./emulator/index.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const s      = __webpack_require__(/*! ./binary_strings */ \"./emulator/binary_strings.js\");\nconst dbgr   = __webpack_require__(/*! ./debugger */ \"./emulator/debugger.js\");\nconst state  = __webpack_require__(/*! ./state */ \"./emulator/state.js\");\nconst font   = __webpack_require__(/*! ./font */ \"./emulator/font.js\");\nconst timers = __webpack_require__(/*! ./timers */ \"./emulator/timers.js\");\nconst sound  = __webpack_require__(/*! ./sound */ \"./emulator/sound.js\");\nconst disasm = __webpack_require__(/*! ./disassembler */ \"./emulator/disassembler.js\");\n\nlet currentState;\nlet playing = true;\nconst debugging = {\n  debugger: false,\n  opcodes:  false\n};\n\n// Hook up controls under the \"device\"\n\ndocument.getElementById('upload').addEventListener('change', e => {\n  const reader = new FileReader();\n  reader.addEventListener('load', e => startProgram(new Uint8Array(reader.result)));\n  reader.readAsArrayBuffer(e.target.files[0]);\n});\n\ndocument.getElementById('play').addEventListener('click', () => {\n  playing = !playing;\n  if ( playing ) requestAnimationFrame(run);\n  document.getElementById('play').innerText = playing ? 'Pause' : 'Play';\n  document.getElementById('step').disabled = playing;\n});\n\ndocument.getElementById('step').addEventListener('click', () => {\n  state.step(currentState)\n       .then(() => dbgr.render(currentState));\n});\n\ndocument.getElementById('show_dbg').addEventListener('click', () => {\n  debugging.debugger = !debugging.debugger;\n  if ( currentState )\n    currentState.debugging = debugging;\n  document.getElementById('show_dbg').classList.toggle('active');\n  if ( !debugging.debugger )\n    document.getElementById('debugger').innerText = '';\n});\n\ndocument.getElementById('show_opc').addEventListener('click', () => {\n  debugging.opcodes = !debugging.opcodes;\n  if ( currentState )\n    currentState.debugging = debugging;\n  document.getElementById('show_opc').classList.toggle('active');\n});\n\n// Load and run program\n\nfunction startProgram(program) {\n  currentState = state.new();\n  currentState.debugging = debugging;\n  font.load(currentState);\n  timers.connect(currentState);\n  sound.connect(currentState);\n\n  console.info(`Program read from disk:\\n\\n${disasm.disassemble(program)}\\n\\nLoading into RAM...`);\n\n  writePointer = 0x200;\n  for ( let byte of program ) {\n    currentState.ram[writePointer] = byte;\n    writePointer++;\n  }\n\n  console.info(`Starting program...`);\n\n  if ( playing ) run();\n}\n\nfunction run() {\n  if ( playing )\n    setTimeout(() => {\n      state.tenSteps(currentState)\n      .then(() => {\n        dbgr.render(currentState);\n        run();\n      });\n    }, 17);\n}\n\n\n//# sourceURL=webpack:///./emulator/index.js?");

/***/ }),

/***/ "./emulator/keyboard.js":
/*!******************************!*\
  !*** ./emulator/keyboard.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("const kbdState = new Array(16);\n\nmodule.exports = {\n  pressed: key => {\n    return kbdState[key];\n  },\n\n  waitPress: () => {\n    return new Promise((resolve, reject) => {\n      let interval = setInterval(() => {\n        // If any key is pressed, wait for release\n        if ( kbdState.every(b => !b) ) {\n          clearInterval(interval);\n          interval = setInterval(() => {\n            for ( let i in kbdState ) {\n              if ( kbdState[i] ) {\n                clearInterval(interval);\n                return resolve(i);\n              }\n            }\n          }, 10);\n        }\n      }, 10);\n    });\n  }\n}\n\nconst keyMap = {\n  '0': 0,\n  '1': 1,\n  '2': 2,\n  '3': 3,\n  '4': 4,\n  '5': 5,\n  '6': 6,\n  '7': 7,\n  '8': 8,\n  '9': 9,\n  'a': 10,\n  'b': 11,\n  'c': 12,\n  'd': 13,\n  'e': 14,\n  'f': 15,\n\n  'ArrowUp':    2,\n  'ArrowDown':  8,\n  'ArrowLeft':  4,\n  'ArrowRight': 6,\n  ' ':          5\n}\n\nwindow.addEventListener('keydown', e => {\n  if ( keyMap[e.key] == null ) return;\n  kbdState[keyMap[e.key]] = true;\n  const button = document.getElementById('Btn'+keyMap[e.key]);\n  if ( button ) button.classList.add('active');\n  e.preventDefault();\n});\n\nwindow.addEventListener('keyup', e => {\n  if ( keyMap[e.key] == null ) return;\n  kbdState[keyMap[e.key]] = false;\n  const button = document.getElementById('Btn'+keyMap[e.key]);\n  if ( button ) button.classList.remove('active');\n  e.preventDefault();\n});\n\ndocument.querySelectorAll('.keyboard button').forEach(b => {\n  b.addEventListener('mousedown',  e => key(e.target.id, true));\n  b.addEventListener('touchstart', e => key(e.target.id, true));\n});\n\ndocument.querySelectorAll('.keyboard button').forEach(b => {\n  b.addEventListener('mouseup',   e => key(e.target.id, false));\n  b.addEventListener('touchstop', e => key(e.target.id, false));\n});\n\nfunction key(id, state) {\n  const index = id.substr(3);\n  kbdState[index] = state;\n}\n\n\n//# sourceURL=webpack:///./emulator/keyboard.js?");

/***/ }),

/***/ "./emulator/opcodes.js":
/*!*****************************!*\
  !*** ./emulator/opcodes.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const s = __webpack_require__(/*! ./binary_strings */ \"./emulator/binary_strings.js\");\nconst keyboard = __webpack_require__(/*! ./keyboard */ \"./emulator/keyboard.js\");\n\nmodule.exports = {\n\n  '00E0': ({state}) => {\n    for ( let n = 0x0F00; n <= 0x0FFF; n++ ) state.ram[n] = 0;\n    state.sd = true;\n    return 'CLEAR';\n  },\n\n  '00EE': ({state, disassemble}) => {\n    if ( disassemble )\n      return 'RETURN';\n\n    state.sp += 2;\n    state.pc = state.ram[state.sp - 0] + state.ram[state.sp - 1] * 0x100;\n    return `RETURN ${s.word2str(state.pc)}`;\n  },\n\n  '0...': () => console.error('RCA 1802 Not implemented'),\n\n  '1...': ({state, nnn}) => {\n    state.pc = nnn - 2; // Step back one instruction because we step ahead later\n    return `JUMP ${s.word2str(nnn)}`;\n  },\n\n  '2...': ({state, nnn}) => {\n    state.ram[state.sp - 0] =  state.pc & 0x00ff;\n    state.ram[state.sp - 1] = (state.pc & 0xff00) / 0x100;\n    state.sp -= 2;\n    state.pc = nnn - 2; // Step back one instruction because we step ahead later\n    return `CALL ${s.word2str(nnn)}`;\n  },\n\n  '3...': ({state, x, nn}) => {\n    if ( state.v[x] === nn ) state.pc += 2;\n    return `SKIP_IF_EQUAL_TO V${x}, ${s.byte2str(nn)}`;\n  },\n\n  '4...': ({state, x, nn}) => {\n    if ( state.v[x] !== nn ) state.pc += 2;\n    return `SKIP_IF_UNEQUAL_TO V${x}, ${s.byte2str(nn)}`;\n  },\n\n  '5..0': ({state, x, y}) => {\n    if ( state.v[x] === state.v[y] ) state.pc += 2;\n    return `SKIP_IF_SAME V${x}, V${y}`;\n  },\n\n  '6...': ({state, x, nn}) => {\n    state.v[x] = nn;\n    return `LOAD V${x}, ${s.byte2str(nn)}`;\n  },\n\n  '7...': ({state, x, nn}) => {\n    state.v[x] += nn;\n    return `ADD_VALUE V${x}, ${s.byte2str(nn)}`;\n  },\n\n  '8..0': ({state, x, y}) => {\n    state.v[x] = state.v[y];\n    return `ASSIGN V${x}, V${y}`;\n  },\n\n  '8..1': ({state, x, y}) => {\n    state.v[x] |= state.v[y];\n    return `OR V${x}, V${y}`;\n  },\n\n  '8..2': ({state, x, y}) => {\n    state.v[x] &= state.v[y];\n    return `AND V${x}, V${y}`;\n  },\n\n  '8..3': ({state, x, y}) => {\n    state.v[x] ^= state.v[y];\n    return `XOR V${x}, V${y}`;\n  },\n\n  '8..4': ({state, x, y}) => {\n    state.v[x] += state.v[y];\n    state.v[0xF] = state.v[x] + state.v[y] > 255 ? 1 : 0;\n    return `ADD V${x}, V${y}`;\n  },\n\n  '8..5': ({state, x, y}) => {\n    state.v[x] -= state.v[y];\n    state.v[0xF] = state.v[x] >= state.v[y] ? 1 : 0;\n    return `SUB V${x}, V${y}`;\n  },\n\n  '8..6': ({state, x}) => {\n    state.v[0xF] = state.v[x] & 0b00000001 ? 1 : 0;\n    state.v[x]   = state.v[x] >> 1;\n    return `SHIFT_RIGHT V${x}`;\n  },\n\n  '8..7': ({state, x, y}) => {\n    state.v[x] = state.v[y] - state.v[x];\n    state.v[0xF] = state.v[y] >= state.v[x] ? 1 : 0;\n    return `SUB_INVERSE V${x}, V${y}`;\n  },\n\n  '8..E': ({state, x}) => {\n    state.v[0xF] = state.v[x] & 0b10000000 ? 1 : 0;\n    state.v[x]   = state.v[x] << 1;\n    return `SHIFT_LEFT V${x}`;\n  },\n\n  '9..0': ({state, x, y}) => {\n    if ( state.v[x] !== state.v[y] ) state.pc += 2;\n    return `SKIP_IF_UNEQUAL V${x}, V${y}`;\n  },\n\n  'A...': ({state, nnn}) => {\n    state.i = nnn;\n    return `SET_I ${s.word2str(nnn)}`;\n  },\n\n  'B...': ({state, nnn}) => {\n    state.pc = nnn + state.v[0] - 2; // Step back one instruction because we step ahead later\n    return `JUMP V0 + ${s.word2str(nnn)}`;\n  },\n\n  'C...': ({state, x, nn}) => {\n    state.v[x] = Math.floor(Math.random() * 255) & nn;\n    return `RAND V${x}, ${s.byte2str(nn)}`;\n  },\n\n  'D...': ({state, x, y, n}) => {\n    const xPos = state.v[x];\n    const yPos = state.v[y];\n\n    const memoryOffset = Math.floor(yPos * 8 + xPos / 8);\n    let flipped = false;\n\n    for ( let i = 0; i < n; i++ ) {\n      const spritePart = state.ram[state.i + i];\n\n      flipped = !!(state.ram[0x0F00 + memoryOffset + i * 8 + 0] & spritePart >> (xPos % 8)) ||\n                !!(state.ram[0x0F00 + memoryOffset + i * 8 + 1] & spritePart << (8 - (xPos % 8)) & 0xFF);\n\n      state.ram[0x0F00 + memoryOffset + i * 8 + 0] ^= spritePart >> (xPos % 8);\n      state.ram[0x0F00 + memoryOffset + i * 8 + 1] ^= spritePart << (8 - (xPos % 8)) & 0xFF;\n    }\n    state.sd = true;\n    state.v[0xF] = flipped ? 1 : 0;\n\n    return `DRAW ${xPos}, ${yPos}, ${n}, ${s.word2str(state.i)}`;\n  },\n\n  'E.9E': ({state, x}) => {\n    if ( keyboard.pressed(state.v[x]) ) state.pc += 2;\n    return `SKIP_IF_KEYPRESS V${x}`;\n  },\n\n  'E.A1': ({state, x}) => {\n    if ( !keyboard.pressed(state.v[x]) ) state.pc += 2;\n    return `SKIP_UNLESS_KEYPRESS V${x}`;\n  },\n\n  'F.07': ({state, x}) => {\n    state.v[x] = state.delay;\n    return `GET_DELAY V${x}`;\n  },\n\n  'F.0A': ({state, x, disassemble}) => {\n    if ( disassemble )\n      return `GET_KEY V${x}`;\n\n    return keyboard.waitPress()\n                   .then(key => {\n                     state.v[x] = key;\n                     return `GET_KEY V${x}`;\n                   });\n  },\n\n  'F.15': ({state, x}) => {\n    state.delay = state.v[x];\n    return `SET_DELAY V${x}`;\n  },\n\n  'F.18': ({state, x}) => {\n    state.sound = state.v[x];\n    return `SET_SOUND V${x}`;\n  },\n\n  'F.1E': ({state, x}) => {\n    const newValue = state.i + state.v[x];\n    state.v[0xF] = newValue > 0xFFF ? 1 : 0;\n    state.i = newValue & 0xFFF;\n    return `ADD_TO_I V${x}`;\n  },\n\n  'F.29': ({state, x}) => {\n    state.i = state.v[x] * 5;\n    return `LOAD_FONT V${x}`;\n  },\n\n  'F.33': ({state, x}) => {\n    state.ram[state.i + 0] = state.v[x] % 1000 / 100;\n    state.ram[state.i + 1] = state.v[x] % 100 / 10;\n    state.ram[state.i + 2] = state.v[x] % 10;\n    return `STORE_BCD V${x}`;\n  },\n\n  'F.55': ({state, x}) => {\n    for ( let n = 0; n <= x; n++ )\n      state.ram[state.i + n] = state.v[n];\n    return `SAVE_REGISTERS V0 - V${x}`;\n  },\n\n  'F.65': ({state, x}) => {\n    for ( let n = 0; n <= x; n++ )\n      state.v[n] = state.ram[state.i + n];\n    return `LOAD_REGISTERS V0 - V${x}`;\n  }\n\n}\n\n\n//# sourceURL=webpack:///./emulator/opcodes.js?");

/***/ }),

/***/ "./emulator/sound.js":
/*!***************************!*\
  !*** ./emulator/sound.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = {\n  connect: state => {\n\n    // Some beep code I pulled off Stack Overflow ;)\n\n    //if you have another AudioContext class use that one, as some browsers have a limit\n    var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);\n\n    //All arguments are optional:\n\n    //duration of the tone in milliseconds. Default is 500\n    //frequency of the tone in hertz. default is 440\n    //volume of the tone. Default is 1, off is 0.\n    //type of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.\n    //callback to use on end of tone\n    function beep(duration, frequency, volume, type, callback) {\n        var oscillator = audioCtx.createOscillator();\n        var gainNode = audioCtx.createGain();\n\n        oscillator.connect(gainNode);\n        gainNode.connect(audioCtx.destination);\n\n        if (volume){gainNode.gain.value = volume;};\n        if (frequency){oscillator.frequency.value = frequency;}\n        if (type){oscillator.type = type;}\n        if (callback){oscillator.onended = callback;}\n\n        oscillator.start();\n        setTimeout(function(){oscillator.stop()}, (duration ? duration : 500));\n    };\n\n    // If the sound timer is not zero yet, play a beep\n    setInterval(() => {\n      if ( state.sound > 0 ) beep(17);\n    }, 17) // 60Hz\n  }\n}\n\n\n//# sourceURL=webpack:///./emulator/sound.js?");

/***/ }),

/***/ "./emulator/state.js":
/*!***************************!*\
  !*** ./emulator/state.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const s       = __webpack_require__(/*! ./binary_strings */ \"./emulator/binary_strings.js\");\nconst opcodes = __webpack_require__(/*! ./opcodes */ \"./emulator/opcodes.js\");\nconst display = __webpack_require__(/*! ./display */ \"./emulator/display.js\");\n\nmodule.exports = {\n  new: () => ({\n    pc:  0x0200,                // Program counter\n    sp:  0x0EFF,                // Stack pointer\n    i:   0x0000,                // Index register\n    v:   new Uint8Array(16),    // Other registers\n    ram: new Uint8Array(4096),  // Memory\n    sd:  false,                 // Screen dirty\n    delay: 0,                   // Delay timer\n    sound: 0,                   // Sound timer\n\n    debugging: {\n      debugger: false,\n      opcodes:  false\n    }\n  }),\n\n  tenSteps: async state => {\n    for ( let i = 0; i < 10; i++ ) await step(state);\n  },\n\n  step\n}\n\nasync function step(state) {\n  const highByte  = state.ram[state.pc];\n  const lowByte   = state.ram[state.pc+1];\n  const opcode    = s.bin2str([highByte, lowByte], '');\n  const old_pc    = state.pc;\n  let instruction = \"UNKNOWN INSTRUCTION\";\n\n  // Look up and execute opcode\n  for ( let match in opcodes ) {\n    if ( opcode.match(new RegExp(match, 'i')) ) {\n      instruction = await opcodes[match]({\n        highByte,\n        lowByte,\n        state,\n\n        nnn: (highByte & 0b00001111) * 0x100 + lowByte,\n        nn:  lowByte,\n        n:   lowByte  & 0b00001111,\n        x:   highByte & 0b00001111,\n        y:   (lowByte & 0b11110000) >> 4\n      });\n      break;\n    }\n  }\n\n  // Render display if dirty\n  if ( state.sd ) {\n    display.render(state);\n    state.sd = false;\n  }\n\n  // Render output if needed/requested\n  const output = `${s.word2str(old_pc)}:\\t${opcode}\\t${instruction}\\n`;\n  if ( instruction == \"UNKNOWN INSTRUCTION\" )\n    console.error(output);\n  else if ( state.debugging.opcodes )\n    console.info(output);\n\n  // Go to next instruction\n  state.pc += 2;\n}\n\n\n//# sourceURL=webpack:///./emulator/state.js?");

/***/ }),

/***/ "./emulator/timers.js":
/*!****************************!*\
  !*** ./emulator/timers.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = {\n  connect: state => {\n    setInterval(() => {\n      if ( state.delay > 0 ) state.delay--;\n      if ( state.sound > 0 ) state.sound--;\n    }, 17) // ~60Hz\n  }\n}\n\n\n//# sourceURL=webpack:///./emulator/timers.js?");

/***/ })

/******/ });