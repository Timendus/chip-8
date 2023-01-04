const parser = require('./parser');
const util = require('util');
const assembler = require('../assembler');
const generator = require('./generator');
const stdio = require('./stdio.chc');

module.exports = (source, options = {}) => {
  const tree = parse(source);

  if ( options.outputAST )
    console.log(util.inspect(tree, false, null, true));

  const assembly = generator(tree, {
    addendum: compiledStdio(),
    standalone: true
  });

  return {
    assembly: assembly.assembly,
    binary: assembler(assembly.assembly)
  };
}

function parse(source) {
  let tree;
  try {
    tree = parser.parse(source);
  } catch(e) {
    let error;
    if ( e.found )
      error = `CHIPcode syntax error: Found '${e.found.replace(/\n/, '\\n')}' at line ${e.location.start.line} column ${e.location.start.column}`;
    else
      error = `CHIPcode syntax error: I seem to be missing something at line ${e.location.start.line} column ${e.location.start.column}`;
    error += `I expected any of these:\n${e.expected.map(t => `\t* ${t.description || t.text || t.type}\n`).filter((v,i,a) => a.indexOf(v) === i).join('')}`;
    throw error;
  }
  return tree;
}

function compiledStdio() {
  const tree = parse(stdio);
  return generator(tree, {
    standalone: false
  });
}
