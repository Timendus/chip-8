module.exports = class Scope {

  constructor() {
    this.variables = {};
  }

  declare(name) {
    this.variables[name] = this.nextFreeRegister();
    return name;
  }

  get_register(name) {
    if ( !this.declared(name) ) throw `Unknown variable: '${name}'`;
    return this.variables[name];
  }

  release(name) {
    if ( !this.declared(name) ) throw `Unknown variable: '${name}'`;
    delete this.variables[name];
  }

  declared(name) {
    return Number.isInteger(this.variables[name]);
  }

  highestRegister() {
    return Math.max(...Object.values(this.variables), 0);
  }

  replaceVariables(str) {
    if ( Object.keys(this.variables).length == 0 )
      return str;

    return str.replace(
      new RegExp(Object.keys(this.variables).map(v => `\\b${v}\\b`).join('|'), 'gi'),
      matched => `v${this.variables[matched]}`
    );
  }

  nextFreeRegister() {
    const variablesInUse = Object.keys(this.variables).length;
    if ( variablesInUse >= 14 )
      throw 'Too many variables in scope (max 14)';
    else if ( variablesInUse > 0 )
      return Math.max(...Object.values(this.variables)) + 1;
    else
      return 1; // We leave v0 available for intermediate results
  }

}
