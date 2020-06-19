const stdio = require('./stdio.asm');
const Scope = require('./scope');

let functions = [];
let labels    = 0;
let tempvars  = 0;

module.exports = tree => {
  // Before compilation, get a list of available functions in the program
  functions = getFunctions(tree);

  return [
    `.org $200`,
    `begin_of_program:`,
    ...codeGenerator({ block: tree, scope: new Scope() }),
    `endless_loop:`,
    `  jp endless_loop`,
    stdio,
    `end_of_program:`
  ].join('\n');
}

function getFunctions(tree) {
  // Only top level functions for now, easy to fix later
  return tree.filter(n => n && n.type == 'function')
             .reduce((o, f) => {o[f.name] = f; return o}, {});
}

function codeGenerator({ block, scope }) {
  if ( typeof block === 'array' || block instanceof Array )
    return block.filter(b => b) // Remove undefined's
                .map(b => codeGenerator({ block: b, scope }))
                .flat();

  if ( typeof block === 'object' ) {
    const instruction = block;
    switch(block.type) {
      case 'declaringassignment':
        return [...declaration({ instruction, scope }), ...assignment({ instruction, scope })];
      case 'declaration':
        return declaration({ instruction, scope });
      case 'assignment':
        return assignment({ instruction, scope });
      case 'if':
        return conditional({ instruction, scope });
      case 'while':
        return whileloop({ instruction, scope });
      case 'functioncall':
        return functioncall({ instruction, scope });
      case 'function':
        return functiondefinition({ instruction, scope });
      case 'return':
        return returnvalue({ instruction, scope });
      case 'assembly':
        return instruction.instructions.map(i => scope.replaceVariables(i));
      default:
        throw `Unhandled instruction type: ${instruction.type}`;
        return;
    }
  }

  throw `Unknown thing: ${typeof block}`;
}

/** Instruction generation **/

function declaration({ instruction, scope }) {
  switch(instruction.datatype) {
    case 'byte':
      scope.declare(instruction.name);
      return [];
    default:
      throw `Unhandled datatype: ${instruction.datatype}`;
  }
}

function assignment({ instruction, scope }) {
  return expression({
    expr: instruction.expression,
    target: scope.get_register(instruction.name),
    scope
  });
}

function conditional({ instruction, scope }) {
  const expr = expression({ expr: instruction.expression, scope });
  const block = codeGenerator({ block: instruction.block, scope });
  const label = ++labels;
  return [
       ...expr,
    `  sne v0, 0`,
    `  jp if_${label}`,
       ...block,
    `if_${label}:`
  ];
}

function whileloop({ instruction, scope }) {
  const result = scope.declare(`tempvar_${++tempvars}`);
  const expr = expression({ expr: instruction.expression, target: scope.get_register(result), scope });
  const block = codeGenerator({ block: instruction.block, scope });
  const label1 = ++labels;
  const label2 = ++labels;
  return [
    `while_${label1}:`,
       ...expr,
    `  sne v${scope.get_register(result)}, 0`,
    `  jp while_${label2}`,
       ...block,
    `  jp while_${label1}`,
    `while_${label2}:`
  ];
  scope.release(result);
}

function functioncall({ instruction, target = 0, scope }) {
  stdio_functions = [
    'clear_screen',
    'print_byte'
  ];

  let func_name;
  if ( stdio_functions.includes(instruction.name) )
    func_name = instruction.name;
  else if ( Object.keys(functions).includes(instruction.name) )
    func_name = `func_${instruction.name}`;
  else
    throw `Unknown function '${instruction.name}'`;

  let assembly = [];
  // Save current scope
  if ( !functions[instruction.name].safe )
    assembly = assembly.concat([
      `  ld i, end_of_program`,
      `  ld (i), v0-v14`
    ]);

  // Create a new scope
  const callScope = new Scope();

  if ( instruction.parameters.length > 0 ) {
    // Params should be first couple of registers, so declare those first
    const params = instruction.parameters.map((p, i) =>
      callScope.declare(`param_${i}`)
    );

    // Now for the tricky part: set the new scope without messing with the old
    // scope too much. Because expressions may need it...
    // TODO
    assembly = assembly.concat(instruction.parameters
      .map((p, i) => [
           ...expression({
             expr: p,
             target: callScope.get_register(params[i]), // Messes up old scope
             scope
           })
      ])
      .flat()
    );
  }

  assembly.push(`  call ${func_name}`);

  // Restore old scope
  if ( !functions[instruction.name].safe )
    assembly = assembly.concat([
      `  ld i, end_of_program`,
      `  ld v0-v14, (i)`
    ]);

  if ( target != 15 )
    assembly.push(`  ld v${target}, v15`);

  return assembly;
}

// New plan: on function call, store all (referenced) vars in memory, restart
// fresh with just variables for the parameters. On return, delete all new vars
// and reset old vars from memory, except explicitly returned value. Functions
// without side-effects (except maybe stdio).

function functiondefinition({ instruction, scope }) {
  const functionScope = new Scope();
  instruction.parameters.forEach(p => {
    functionScope.declare(p.name);
  });

  return [
    `  jp func_end_${instruction.name}`,
    `func_${instruction.name}:`,
       ...codeGenerator({ block: instruction.block, scope: functionScope }),
    `  ret`,
    `func_end_${instruction.name}:`
  ];
}

function returnvalue({ instruction, scope }) {

}

/** Expression generation **/

function expression({ expr, target = 0, scope }) {
  switch(expr.type) {
    case 'integer':
      return [`  ld v${target}, ${expr.value}`];
    case 'variable':
      if ( target === scope.get_register(expr.name) ) return []; // No need to assign to itself
      return [`  ld v${target}, v${scope.get_register(expr.name)}`]; // This is dumb, but it works
    case 'functioncall':
      return functioncall({ instruction: expr, target, scope });

    // Floats / chars / etc in future here?

    default:
      const variable = scope.declare(`tempvar_${++tempvars}`);
      const left = expression({ expr: expr.left, target: scope.get_register(variable), scope });
      const right = expression({ expr: expr.right, scope });
      let assembly = [];
      switch(expr.type) {
        case 'lessthan': // left < right == left - right <= 0
          assembly = [
               ...left,
               ...right,
            `  sub v${scope.get_register(variable)}, v0`,
            `  ld v${target}, v15`, // vF
            `  ld v${scope.get_register(variable)}, 1`,
            `  xor v${target}, v${scope.get_register(variable)}`
          ];
          break;
        case 'greaterthan': // left > right == right - left <= 0
          assembly = [
               ...left,
               ...right,
            `  sub v0, v${scope.get_register(variable)}`,
            `  ld v${target}, v15`, // vF
            `  ld v${scope.get_register(variable)}, 1`,
            `  xor v${target}, v${scope.get_register(variable)}`
          ];
          break;
        case 'equalto':
          assembly = [
               ...left,
               ...right,
            `  se v${scope.get_register(variable)}, v0`,
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
            `  add v${scope.get_register(variable)}, v0`,
            `  ld v${target}, v${scope.get_register(variable)}`
          ];
          break;
        case 'subtraction':
            assembly = [
                 ...left,
                 ...right,
              `  sub v${scope.get_register(variable)}, v0`,
              `  ld v${target}, v${scope.get_register(variable)}`
            ];
            break;
        case 'multiplication':
          const count = scope.declare(`tempvar_${++tempvars}`);
          const result = scope.declare(`tempvar_${++tempvars}`);
          assembly = [
               ...left,
               ...right,
            `  ld v${scope.get_register(count)}, 0`,
            `  ld v${scope.get_register(result)}, 0`,
            `  sne v0, 0`,
            `  jp mult_${labels+2}`,
            `  sne v${scope.get_register(variable)}, 0`,
            `  jp mult_${labels+2}`,
            `mult_${++labels}:`,
            `  add v${scope.get_register(result)}, v0`,
            `  add v${scope.get_register(count)}, 1`,
            `  se v${scope.get_register(variable)}, v${scope.get_register(count)}`,
            `  jp mult_${labels}`,
            `mult_${++labels}:`,
            `  ld v${target}, v${scope.get_register(result)}`
          ];
          scope.release(count);
          scope.release(result);
          break;
        case 'division':
          const counter = scope.declare(`tempvar_${++tempvars}`);
          const one = scope.declare(`tempvar_${++tempvars}`);
          assembly = [
               ...left,
               ...right,
            `  ld v${scope.get_register(counter)}, 0`,
            `  ld v${scope.get_register(one)}, 1`,
            `div_${++labels}:`,
            `  add v${scope.get_register(counter)}, v${scope.get_register(one)}`,
            `  sub v${scope.get_register(variable)}, v0`,
            `  sne v${scope.get_register(one)}, v15`, // vF
            `  jp div_${labels}`,
            `  sub v${scope.get_register(counter)}, v${scope.get_register(one)}`,
            `  ld v${target}, v${scope.get_register(counter)}`
          ];
          scope.release(counter);
          scope.release(one);
          break;
        default:
          throw `Unhandled expression type: ${expr.type}`;
      }
      scope.release(variable);
      return assembly;
  }
}
