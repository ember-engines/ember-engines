import Ember from 'ember';

const {
  RouterDSL: EmberRouterDSL,
  assign
} = Ember;

let uuid = 0;

EmberRouterDSL.prototype.mount = function(_name, _options) {
  let options = _options || {};
  let engineRouteMap = this.options.resolveRouteMap(_name);
  let name = _name;

  if (options.as) {
    name = options.as;
  }

  var fullName = getFullName(this, name, options.resetNamespace);

  let engineInfo = {
    name: _name,
    instanceId: uuid++,
    mountPoint: fullName,
    fullName
  };

  let path = options.path;

  if (typeof path !== 'string') {
    path = `/${name}`;
  }

  let callback;
  if (engineRouteMap) {
    let optionsForChild = assign({ engineInfo }, this.options);
    let childDSL = new EmberRouterDSL(fullName, optionsForChild);

    engineRouteMap.call(childDSL);

    callback = childDSL.generate();
  }

  let localFullName = 'application';
  let routeInfo = assign({ localFullName }, engineInfo);

  this.push(path, fullName, callback);
};

EmberRouterDSL.prototype.push = function(url, fullName, callback) {
  var parts = fullName.split('.');

  if (this.options.engineInfo) {
    let localFullName = fullName.slice(this.options.engineInfo.fullName.length + 1);
    let routeInfo = assign({ localFullName }, this.options.engineInfo);

    this.options.addRouteForEngine(fullName, routeInfo);
  }

  if (url === '' || url === '/' || parts[parts.length - 1] === 'index') {
    this.explicitIndex = true;
  }

  this.matches.push([url, fullName, callback]);
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
