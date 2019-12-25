#!/usr/bin/env node

// This is the command line executable form of the assembler

const compiler = require('./index');
const argv     = require('yargs').argv;
const fs       = require('fs');

if ( !argv.file ) {
  return console.error('\nYou need to specify a file to compile.\n\n./asm.js --file myprogram.asm --output binary.ch8');
}

let file;
try {
  file = fs.readFileSync(argv.file, { encoding: 'utf8' });
} catch(e) {
  return console.error('\nCould not read your specified file :/\n', e.message);
}

try {
  file = Buffer.from(compiler(file));
} catch(e) {
  return console.error(`${e}`);
}

if ( !argv.output )
  console.log(file);
else
  fs.writeFileSync(argv.output, file);
