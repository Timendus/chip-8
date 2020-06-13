#!/usr/bin/env node

// This is the command line executable form of the assembler

const assembler = require('./index');
const argv      = require('yargs').argv;
const fs        = require('fs');
const s         = require('./../shared/binary_strings');

if ( !argv.file ) {
  return console.error('\nYou need to specify a file to assemble.\n\n./asm.js --file myprogram.asm [--output binary.ch8] [--outputModel] [--outputLabels]');
}

let file;
try {
  file = fs.readFileSync(argv.file, { encoding: 'utf8' });
} catch(e) {
  return console.error('\nCould not read that file 😕\n', e.message);
}

try {
  file = assembler(file, {
    outputModel:  argv.outputModel  ? true : null,
    outputLabels: argv.outputLabels ? true : null
  });
} catch(e) {
  return console.error(`${e}`);
}

if ( argv.output )
  return fs.writeFileSync(argv.output, Buffer.from(file));

const output = [];
for ( let i = 0; i < file.length; i += 2 ) {
  output.push(s.byte2str(file[i]) + s.byte2str(file[i+1]));
}
console.log(output.join(' '));
