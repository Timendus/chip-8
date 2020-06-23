const peg = require('pegjs');
module.exports = peg.generate(`

  start
    = lines:(line*) __* { return lines; }

  line
    = __* statement:statement { return statement; }

  statement
    = EOL { return undefined; }
    / comment EOL { return undefined; }
    / variables:variables EOI { return variables; }
    / func:function { return func; }
    / controlflow
    / assembly

  function
    = safe:"safe"? ___? "function" ___ name:name _ "(" _ parameters:(funcparameters*) ")" _ "{" block:(line*) _ "}" { return { type: 'function', name, parameters, block, safe: safe == 'safe' }; }

  funcparameters
    = parameter:funcparameter _ ","? _ { return parameter; }

  funcparameter
    = datatype:type ___ name:name _ "=" _ expression:expression { return { datatype, name }}
    / datatype:type ___ name:name { return { datatype, name }; }

  controlflow
    = "while" _ "(" _ expression:expression _ ")" _ "{" _ block:(line*) _ "}" { return { type: 'while', expression, block, location: location() }; }
    / "if" _ "(" _ expression:expression _ ")" _ "{" _ block:(line*) _ "}" { return { type: 'if', expression, block, location: location() }; }
    / func:functioncall EOI { return func; }
    / "return" _ expression:expression EOI { return { type: 'return', expression, location: location() }; }

  assembly
    = "raw" ___ instruction:assembly_instruction_single_line { return { type: 'assembly', instructions: ['  ' + instruction] }; }
    / "raw <<" EOL? instructions:(assembly_instruction*) _ ">>" { return { type: 'assembly', instructions }; }

  assembly_instruction_single_line
    = instruction:[a-zA-Z0-9_ \\t\.,\(\)\+;:\-]+ { return instruction.join(''); }
  assembly_instruction
    = instruction:[a-zA-Z0-9_ \\t\.,\(\)\+\\n\\r;:\-]+ { return instruction.join(''); }

  functioncall
    = name:name _ "(" _ parameters:(callparameter*) _ ")" { return { type: 'functioncall', name, parameters, location: location() }; }

  callparameter
    = expression:expression _ ","? _ { return expression; }

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
    / functioncall
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
