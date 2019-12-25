// This is the importable module form of the assembler

const opcodes    = require('./opcodes');
const directives = require('./directives');
const e          = require('./expressions');
const s          = require('../emulator/binary_strings');

module.exports = (source) => {

  const lines  = source.split('\n');
  const model  = [];
  const errors = [];

  lines.forEach((line, linenum) => {
    line = line.split(';')[0];  // Strip out comments
    if ( !line.trim() ) return; // Strip out empty lines

    let interpretation;
    if ( line.match(/^\s+/) && !line.match(/^\s+\./) )   // Indented and not starting with .?
      interpretation = opcodes.find(o => line.trim().match(o.instruction));
    else
      interpretation = directives.find(d => line.trim().match(d.instruction));

    if ( !interpretation ) {
      errors.push(`\nError on line ${linenum+1}:\n\tI don't know how to interpret '${line.trim()}'`);
      return;
    }

    const clone = { ...interpretation };
    clone.matches = line.trim().match(clone.instruction);
    clone.line = linenum + 1;
    model.push(clone); // Done!
  });

  // Give every entry in the model its address
  let lastAddress = 0;
  model.forEach(m => {
    m.address = lastAddress;
    if ( m.place )
      lastAddress = m.place(lastAddress, m.matches);
    else if ( m.size )
      lastAddress += m.size;
  })

  // Collect labels
  const labels = Object.fromEntries(
    model.filter(m => m.type === 'label')
         .map(m => [m.matches[1], m.address])
  );
  labels['$errors'] = [];

  // Parse instruction parameters (labels, different number formats, etc)
  model.forEach(m => {
    m.matches = m.matches.splice(1)
                         .map(n => inputValue(labels, n, m.line));
  });

  // Assemble model into bytes
  const bytes = model.filter(m => m.assemble)
                     .map(m => m.assemble(m.matches))
                     .flat();

  // We can't compile what we don't understand
  if ( errors.length > 0 || labels['$errors'].length > 0 )
    throw "\nFound these errors, can't assemble. Sorry 😕\n" +
          errors.join('') + labels['$errors'].join('');

  return Uint8Array.from(bytes);
};

function inputValue(labels, value, line) {
  // Can't handle this case at all
  if ( value === undefined ) return value;

  // Make sure value is string for matching
  value = '' + value;

  // If known label, we're good
  if ( labels[value] ) return labels[value];

  // If not numeric value(s), give error
  if ( !value.match(`^${e.values}$`) ) {
    labels['$errors'].push(`\nError on line ${line}:\n\tI can't find label '${value}'`);
    return 0;
  }

  // Otherwise, parse numeric value(s)
  values = value.split(',').map(v => v.trim());
  const results = [];

  values.forEach(value => {
    result = any2bytes(value);

    if ( result.length == 0 )
      labels['$errors'].push(`\nError on line ${line}:\n\tInvalid value '${value}'`);
    else
      results.push(...result);
  });

  if ( results.length == 1 ) return results[0];
  return results;
}

function any2bytes(any) {
  if ( any.match(e.hex) ) return [parseInt(any.substr(1), 16)];
  if ( any.match(e.bin) ) return [parseInt(any.substr(1), 2)];
  if ( any.match(e.dec) ) return [parseInt(any, 10)];
  if ( any.match(e.str) ) return any.split('').map(c => c.charCodeAt(0));
  return [];
}
