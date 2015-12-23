import Ember from 'ember';

const {
  RouterDSL: EmberRouterDSL
} = Ember;

EmberRouterDSL.prototype.mount = function(_name, _options) {
  let options = _options || {};
  let engineRouteMap = this.options.resolveRouteMap(_name);
  let name = _name;
  if (options.as) {
    options.resetNamespace = true;
    name = options.as;
  }

  if (engineRouteMap) {
    var fullName = getFullName(this, name, options.resetNamespace);
    var dsl = new EmberRouterDSL(fullName, this.options);

    engineRouteMap.call(dsl);

    createRoute(this, name, options, dsl.generate());
  } else {
    createRoute(this, name, options);
  }
};

function canNest(dsl) {
  return dsl.parent && dsl.parent !== 'application';
}

function getFullName(dsl, name, resetNamespace) {
  if (canNest(dsl) && resetNamespace !== true) {
    return `${dsl.parent}.${name}`;
  } else {
    return name;
  }
}

function createRoute(dsl, name, options, callback) {
  options = options || {};

  var fullName = getFullName(dsl, name, options.resetNamespace);

  if (typeof options.path !== 'string') {
    options.path = `/${name}`;
  }

  dsl.push(options.path, fullName, callback);
}
