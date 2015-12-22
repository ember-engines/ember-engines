import Resolver from 'ember/resolver';

export default Resolver.extend({
  resolveEngine(parsedName) {
    // TODO: clean this up to use latest ember-resolver from npm
    let engineName = parsedName.fullNameWithoutType;
    let engineModule = engineName + '/engine';

    if (requirejs.entries[engineModule]) {
      let module = require(engineModule);

      return module.default;
    }
  }
});
