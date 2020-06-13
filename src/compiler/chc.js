#!/usr/bin/env node

// This is the command line executable form of the compiler

const compiler = require('./index');
const argv     = require('yargs').argv;
const fs       = require('fs');
const s        = require('./../shared/binary_strings');

if ( !argv.file ) {
  return console.error('\nYou need to specify a file to compile.\n\n./chc.js --file myprogram.chc [--output binary.ch8]');
}

let file;
try {
  file = fs.readFileSync(argv.file, { encoding: 'utf8' });
} catch(e) {
  return console.error('\nCould not read that file 😕\n', e.message);
}

try {
  file = compiler(file);
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
