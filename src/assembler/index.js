// This is the importable module form of the assembler

const opcodes    = require('../shared/opcodes');
const directives = require('./directives');
const e          = require('../shared/expressions');
const s          = require('../shared/binary_strings');

module.exports = (source, options) => {

  // Override default options
  options = Object.assign({
    outputModel: false,
    outputLabels: false
  }, options);

  const lines       = source.split('\n');
  const model       = [];
  let   lastAddress = 0;

  lines.forEach((line, linenum) => {
    line = line.split(';')[0];  // Strip out comments
    if ( !line.trim() ) return; // Strip out empty lines

    let interpretation;
    if ( line.match(/^\s+/) && !line.match(/^\s+\./) )   // Indented and not starting with .?
      interpretation = opcodes.find(o => line.trim().match(o.instruction));
    else
      interpretation = directives.find(d => line.trim().match(d.instruction));

    // If we can't find an interpretation, that's an error
    if ( !interpretation )
      return model.push({
        line:   linenum + 1,
        errors: [`I don't know how to interpret '${line.trim()}'`]
      });

    // Make a copy of the opcode or directive and set the fields that we can
    const clone      = { ...interpretation };
    clone.matches    = line.trim().match(clone.instruction);
    clone.line       = linenum + 1;
    clone.errors     = [];
    clone.parameters = getParams(clone);
    clone.address    = lastAddress;

    // Update address
    if ( clone.getAddress )
      lastAddress = clone.getAddress(lastAddress, clone.parameters);
    if ( clone.size )
      lastAddress += clone.size;

    // Done! Next!
    model.push(clone);
  });

  // Collect all labels
  labels = Object.fromEntries(
    model.filter(m => m.type === 'label')
         .map(m => [m.parameters[0], m.address])
  );

  if ( options.outputModel ) console.log(model);
  if ( options.outputLabels ) console.log(labels);

  // Fill in labels
  model.filter(m => m.parameters)
       .forEach(m => {
         m.parameters = m.parameters.map(p => {
           if ( typeof p === 'number' ) return p;
           if ( labels[p] ) return labels[p];
           if ( [_,l,o] = p.match(`(${e.label})${e.w}\\+${e.w}(${e.number})`) )
             return labels[l] + 1 * o;
           m.errors.push(`Could not find label '${p}'`);
           return null;
         });
       });

  // Assemble model into bytes
  const bytes = model.filter(m => m.assemble)
                     .map(m => m.assemble(m.parameters))
                     .flat();

  // Output all errors we encountered
  const errors = model.filter(m => m.errors.length > 0)
                      .map(m => `\nError(s) on line ${m.line}:\n` +
                                    m.errors.map(e => `\t${e}\n`));
  if ( errors.length > 0 )
    throw "\nFound these errors, can't assemble. Sorry 😕\n" + errors.join('');

  return Uint8Array.from(bytes);
};

function getParams(i) {
  if ( !i.matches ) return [];

  return i.matches.splice(1)                    // First match is whole line
                  .filter(n => n !== undefined) // Undefined match is path in regexp not taken
                  .map(value => {
                    value = '' + value;         // Make sure value is string for matching

                    // Are we values?
                    if ( value.match(`^${e.vals}$`) ) {
                      // Always treat as array, to make life easier
                      value = value.split(',').map(v => v.trim());
                      try {
                        return valuesToBytes(value);
                      } catch(e) {
                        i.errors.push(e);
                        return [];
                      }
                    }

                    // Otherwise, we're probably a label
                    else
                      return value;
                  })
                  .flat();
}

// Take any input and try to make an array of bytes from it
function valuesToBytes(values) {
  return values.map(value => {
    if ( value.match(e.hex) ) return parseInt(value.substr(1), 16);
    if ( value.match(e.bin) ) return parseInt(value.substr(1), 2);
    if ( value.match(e.dec) ) return parseInt(value, 10);

    // If input is a string, output it as ascii bytes, without the quotes
    if ( value.match(e.str) ) return value.substr(1, value.length-2).split('').map(c => c.charCodeAt(0));

    throw(`Invalid value '${value}'`);
  }).flat();
}
