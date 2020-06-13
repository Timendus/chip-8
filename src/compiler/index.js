const peg = require("pegjs");

const parser = peg.generate(`
  start
    = lines:(line*) __* { return lines; }

  line
    = __* statement:statement { return statement; }

  statement
    = EOL { return undefined; }
    / comment EOL { return undefined; }
    / variables:variables EOI { return variables; }
    / controlflow

  controlflow
    = "while" _ "(" _ expression:expression _ ")" _ "{" _ block:(line*) _ "}" { return { type: 'while', expression, block, location: location() }; }
    / "if" _ "(" _ expression:expression _ ")" _ "{" _ block:(line*) _ "}" { return { type: 'if', expression, block, location: location() }; }
    / name:name _ "(" _ parameter:expression _ ")" EOI { return { type: 'functioncall', name, parameter, location: location() }; }

  comment
    = "/*" (!"*/" .)* "*/"
    / "//" (!EOL .)*

  variables
    = datatype:type ___ name:name _ "=" _ expression:expression { return { type: 'declaringassignment', datatype, name, expression, location: location() }}
    / name:name _ "=" _ expression:expression { return { type: 'assignment', name, expression, location: location() }}
    / datatype:type ___ name:name { return { type: 'declaration', datatype, name, location: location() }; }

  type
    = "byte"i
    / "word"i

  name
    = name:[a-zA-Z0-9_]+ { return name.join(''); }

  expression
    = left:additive _ ">" _ right:expression { return { type: 'greaterthan', left, right, location: location() }; }
    / left:additive _ "<" _ right:expression { return { type: 'lessthan', left, right, location: location() }; }
    / left:additive _ "==" _ right:expression { return { type: 'equalto', left, right, location: location() }; }
    / left:additive _ "!=" _ right:expression { return { type: 'notequalto', left, right, location: location() }; }
    / additive

  additive
    = left:multiplicative _ "+" _ right:additive { return { type: 'addition', left, right, location: location() }; }
    / left:multiplicative _ "-" _ right:additive { return { type: 'subtraction', left, right, location: location() }; }
    / multiplicative

  multiplicative
    = left:primary _ "*" _ right:multiplicative { return { type: 'multiplication', left, right, location: location() }; }
    / left:primary _ "/" _ right:multiplicative { return { type: 'division', left, right, location: location() }; }
    / primary

  primary
    = integer
    / name:name { return { type: 'variable', name, location: location() }; }
    / "(" _ additive:expression _ ")" { return additive; }
    / "!" _ expression:expression { return { type: 'negation', expression }; }

  integer "integer decimal value"
    = digits:[0-9]+ { return { type: 'integer', value: parseInt(digits.join(""), 10), location: location() }; }

  _ "whitespace"
    = [ \\t\\n\\r]*

  __ "non-breaking whitespace"
    = [ \\t]

  ___ "required non-breaking whitespace"
    = __+

  EOL "end of line"
    = "\\n\\r" / "\\r\\n" / "\\n" / "\\r"

  EOI "end of instruction"
    = ";"
`);

module.exports = (source, options) => {
  let tree;
  try {
    tree = parser.parse(source);
  } catch(e) {
    if ( e.found )
      console.error(`CHIP syntax error: Found '${e.found.replace(/\n/, '\\n')}' at line ${e.location.start.line} column ${e.location.start.column}`);
    else
      console.error(`CHIP syntax error: I seem to be missing something at line ${e.location.start.line} column ${e.location.start.column}`);
    console.error(`I expected any of these:\n${e.expected.map(t => `\t* ${t.description || t.text || t.type}\n`).join('')}`);
    return;
  }

  console.log(tree.filter(l => l));
  return Uint8Array.from([]);
}
