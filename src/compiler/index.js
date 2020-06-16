const peg = require('pegjs');
const util = require('util');
const assembler = require('../assembler');
const stdio = require('./stdio.asm');

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
    / name:name _ "(" _ parameters:(parameter*) _ ")" EOI { return { type: 'functioncall', name, parameters, location: location() }; }

  parameter
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

module.exports = (source, options = {}) => {
  let tree;
  try {
    tree = parser.parse(source);
  } catch(e) {
    if ( e.found )
      console.error(`CHIPcode syntax error: Found '${e.found.replace(/\n/, '\\n')}' at line ${e.location.start.line} column ${e.location.start.column}`);
    else
      console.error(`CHIPcode syntax error: I seem to be missing something at line ${e.location.start.line} column ${e.location.start.column}`);
    console.error(`I expected any of these:\n${e.expected.map(t => `\t* ${t.description || t.text || t.type}\n`).filter((v,i,a) => a.indexOf(v) === i).join('')}`);
    // console.error('');
    // console.error(e);
    return;
  }

  tree = tree.filter(l => l);

  if ( options.outputAST ) console.log(util.inspect(tree, false, null, true));

  const assembly = [
    `.org $200`,
    `begin_of_program:`,
    ...codeGenerator(tree),
    `endless_loop:`,
    `  jp endless_loop`,
    stdio,
    `end_of_program:`
  ].join('\n');

  return {
    assembly,
    binary: assembler(assembly)
  };
}

function codeGenerator(tree) {
  if ( typeof tree === 'array' || tree instanceof Array )
    return tree.map(n => codeGenerator(n))
               .flat();

  if ( typeof tree === 'object' )
    switch(tree.type) {
      case 'declaringassignment':
        return [...declaration(tree), ...assignment(tree)];
      case 'declaration':
        return declaration(tree);
      case 'assignment':
        return assignment(tree);
      case 'if':
        return conditional(tree);
      case 'while':
        return whileloop(tree);
      case 'functioncall':
        return functioncall(tree);
      default:
        throw Error(`Unhandled type: ${tree.type}`);
        return;
    }

  throw Error(`Unknown thing: ${typeof tree}`);
}

const variables = {};

class Variable {

  // Convention: v0 is used as the return register for expressions and function
  // calls. v1 - v14 can be used for free variables. More than 14 variables is
  // currently not possible, but could maybe work on bytes in main memory later.

  constructor(name) {
    this._name = name;
  }

  nextFreeRegister() {
    const variablesInUse = Object.keys(variables).length;
    if ( variablesInUse >= 14 )
      throw Error('Too many variables in scope (max 14)');
    else if ( variablesInUse > 0 )
      return Math.max(...Object.values(variables)) + 1;
    else
      return 1;
  }

  declare() {
    variables[this._name] = this.nextFreeRegister();
    return this;
  }

  declared() {
    return Number.isInteger(variables[this._name]);
  }

  release() {
    if ( !this.declared() ) throw Error(`Unknown variable: '${this._name}'`);
    delete variables[this._name];
    return this;
  }

  register() {
    if ( !this.declared() ) throw Error(`Unknown variable: '${this._name}'`);
    return variables[this._name];
  }

}

let labels   = 0;
let tempvars = 0;

function declaration(statement) {
  switch(statement.datatype) {
    case 'byte':
      new Variable(statement.name).declare();
      return [];
    default:
      throw Error(`Unhandled datatype: ${statement.datatype}`);
  }
}

function assignment(statement) {
  return expression(statement.expression, new Variable(statement.name).register());
}

function expression(statement, target = 0) {
  switch(statement.type) {
    case 'integer':
      return [`  ld v${target}, ${statement.value}`];
    case 'variable':
      return [`  ld v${target}, v${new Variable(statement.name).register()}`]; // This is dumb, but it works
    case 'functioncall':
      return functioncall(statement, target);

    // Floats / chars / etc in future here?

    default:
      const variable = new Variable(`tempvar_${++tempvars}`).declare();
      const left = expression(statement.left, variable.register());
      const right = expression(statement.right);
      let assembly = [];
      switch(statement.type) {
        case 'lessthan': // left < right == left - right <= 0
          assembly = [
               ...left,
               ...right,
            `  sub v${variable.register()}, v0`,
            `  ld v${target}, v15`, // vF
            `  ld v${variable.register()}, 1`,
            `  xor v${target}, v${variable.register()}`
          ];
          break;
        case 'greaterthan': // left > right == right - left <= 0
          assembly = [
               ...left,
               ...right,
            `  sub v0, v${variable.register()}`,
            `  ld v${target}, v15`, // vF
            `  ld v${variable.register()}, 1`,
            `  xor v${target}, v${variable.register()}`
          ];
          break;
        case 'equalto':
          assembly = [
               ...left,
               ...right,
            `  se v${variable.register()}, v0`,
            `  jp equalto_${labels+1}`,
            `  ld v${target}, 1`,
            `  jp equalto_${labels+2}`,
            `equalto_${++labels}:`,
            `  ld v${target}, 0`,
            `equalto_${++labels}:`
          ];
          break;
        case 'addition':
          assembly = [
               ...left,
               ...right,
            `  add v${variable.register()}, v0`,
            `  ld v${target}, v${variable.register()}`
          ];
          break;
        case 'subtraction':
            assembly = [
                 ...left,
                 ...right,
              `  sub v${variable.register()}, v0`,
              `  ld v${target}, v${variable.register()}`
            ];
            break;
        case 'multiplication':
          const count = new Variable(`tempvar_${++tempvars}`).declare();
          const result = new Variable(`tempvar_${++tempvars}`).declare();
          assembly = [
               ...left,
               ...right,
            `  ld v${count.register()}, 0`,
            `  ld v${result.register()}, 0`,
            `  sne v0, 0`,
            `  jp mult_${labels+2}`,
            `  sne v${variable.register()}, 0`,
            `  jp mult_${labels+2}`,
            `mult_${++labels}:`,
            `  add v${result.register()}, v0`,
            `  add v${count.register()}, 1`,
            `  se v${variable.register()}, v${count.register()}`,
            `  jp mult_${labels}`,
            `mult_${++labels}:`,
            `  ld v${target}, v${result.register()}`
          ];
          count.release();
          result.release();
          break;
        case 'division':
          const counter = new Variable(`tempvar_${++tempvars}`).declare();
          const one = new Variable(`tempvar_${++tempvars}`).declare();
          assembly = [
               ...left,
               ...right,
            `  ld v${counter.register()}, 0`,
            `  ld v${one.register()}, 1`,
            `div_${++labels}:`,
            `  add v${counter.register()}, v${one.register()}`,
            `  sub v${variable.register()}, v0`,
            `  sne v${one.register()}, v15`, // vF
            `  jp div_${labels}`,
            `  sub v${counter.register()}, v${one.register()}`,
            `  ld v${target}, v${counter.register()}`
          ];
          counter.release();
          one.release();
          break;
        default:
          throw Error(`Unhandled expression type: ${statement.type}`);
      }
      variable.release();
      return assembly;
  }
}

function conditional(statement) {
  const expr = expression(statement.expression);
  const block = codeGenerator(statement.block.filter(l => l));
  const label = ++labels;
  return [
       ...expr,
    `  sne v0, 0`,
    `  jp if_${label}`,
       ...block,
    `if_${label}:`
  ];
}

function whileloop(statement) {
  const result = new Variable(`tempvar_${++tempvars}`).declare();
  const expr = expression(statement.expression, result.register());
  const block = codeGenerator(statement.block.filter(l => l));
  const label1 = ++labels;
  const label2 = ++labels;
  return [
    `while_${label1}:`,
       ...expr,
    `  sne v${result.register()}, 0`,
    `  jp while_${label2}`,
       ...block,
    `  jp while_${label1}`,
    `while_${label2}:`
  ];
  result.release();
}

function functioncall(statement, target = 0) {
  // Currently only "baked in" routines
  if ( ![
    'clear_screen',
    'print_byte'
  ].includes(statement.name) )
    throw Error(`Unknown function '${statement.name}'`);

  let assembly;
  if ( statement.parameters.length > 0 )
    assembly = [
      ...statement.parameters
          .map((p, i) => [
               ...expression(p),
            `  ld i, end_of_program + ${i}`,
            `  ld (i), v0-v0`
          ])
          .flat(),
      `  call ${statement.name}`
    ];
  else
    assembly = `  call ${statement.name}`;

  if ( target != 0 ) assembly.push(`  ld v${target}, v0`);

  return assembly;
}
