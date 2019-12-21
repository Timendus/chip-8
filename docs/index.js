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

/***/ "./emulator/index.js":
/*!***************************!*\
  !*** ./emulator/index.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\n// Plumbing\n\n// let chipProgram = new Uint8Array([18,78,8,25,1,1,8,1,15,1,1,9,8,9,15,9,1,17,8,17,15,17,1,25,15,25,22,1,22,9,22,17,22,25,252,252,252,252,252,252,252,0,162,2,130,14,242,30,130,6,241,101,0,238,162,2,130,14,242,30,130,6,241,85,0,238,111,16,255,21,255,7,63,0,18,70,0,238,0,224,98,0,34,42,242,41,208,21,112,255,113,255,34,54,114,1,50,16,18,82,242,10,34,42,162,34,208,23,34,66,208,23,18,100]);\nlet chipProgram = new Uint8Array([0,224,162,42,96,12,97,8,208,31,112,9,162,57,208,31,162,72,112,8,208,31,112,4,162,87,208,31,112,8,162,102,208,31,112,8,162,117,208,31,18,40,255,0,255,0,60,0,60,0,60,0,60,0,255,0,255,255,0,255,0,56,0,63,0,63,0,56,0,255,0,255,128,0,224,0,224,0,128,0,128,0,224,0,224,0,128,248,0,252,0,62,0,63,0,59,0,57,0,248,0,248,3,0,7,0,15,0,191,0,251,0,243,0,227,0,67,224,0,224,0,128,0,128,0,128,0,128,0,224,0,224]);\n\ndocument.getElementById('upload').addEventListener('change', e => {\n  const reader = new FileReader();\n  reader.addEventListener('load', e => {\n    // chipProgram = new Uint8Array(reader.result);\n    startProgram(new Uint8Array(reader.result));\n  });\n  reader.readAsArrayBuffer(e.target.files[0]);\n});\n\ndocument.getElementById('step').addEventListener('click', () => {\n  step(state);\n  renderDebugOutput(state);\n});\n\n\n\nlet state;\n\nfunction startProgram(program) {\n  state = newState();\n  console.info(`Program read from disk:\\n\\n${program}\\n\\nLoading into RAM...`);\n\n  writePointer = 0x200;\n  for ( let byte of program ) {\n    state.ram[writePointer] = byte;\n    writePointer++;\n  }\n\n  console.info(`Starting program...`);\n\n  for ( let i = 0; i < 25; i++ ) {\n    step(state);\n    renderDebugOutput(state);\n  }\n}\n\nfunction step(state) {\n  const highByte  = state.ram[state.pc];\n  const lowByte   = state.ram[state.pc+1];\n  const opcode    = bin2str([highByte, lowByte], '');\n  const old_pc    = state.pc;\n  let instruction = false;\n\n  // Look up and execute opcode\n  for ( let match in window.opcodes ) {\n    if ( opcode.match(new RegExp(match, 'i')) ) {\n      instruction = window.opcodes[match]({\n        highByte,\n        lowByte,\n        state,\n\n        nnn: (highByte & 0b00001111) * 0x100 + lowByte,\n        nn:  lowByte,\n        n:   lowByte  & 0b00001111,\n        x:   highByte & 0b00001111,\n        y:   (lowByte & 0b11110000) >> 4\n      });\n      break;\n    }\n  }\n\n  if ( !instruction ) {\n    console.error(`[${word2str(old_pc)}] Instruction was UNKNOWN: ${bin2str([highByte, lowByte])}`);\n  } else {\n    if ( state.sd ) renderDisplay(state);\n    console.info(`[${word2str(old_pc)}] Ran instruction ${bin2str([highByte, lowByte])} `, instruction);\n  }\n\n  // Go to next instruction\n  state.pc += 2;\n}\n\nstartProgram(chipProgram);\n\nfunction newState() {\n  return {\n    pc:  0x0200,                // Program counter\n    sp:  0x0EFF,                // Stack pointer\n    i:   0x0000,                // Index register\n    v:   new Uint8Array(16),    // Other registers\n    ram: new Uint8Array(4096),  // Memory\n    sd:  false                  // Screen dirty\n  };\n}\n\n\n//# sourceURL=webpack:///./emulator/index.js?");

/***/ })

/******/ });