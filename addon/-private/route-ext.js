import Ember from 'ember';

const {
  assert,
  Route,
  getOwner,
  run,
  Error: EmberError
} = Ember;

Route.reopen({
  mount(engineName, options) {
    let owner = getOwner(this);

    assert(
      'You used `Route.mount(\'' + engineName + '\')`, but the engine \'' + engineName + '\' can not be found.',
      owner.hasRegistration(`engine:${engineName}`)
    );

    let engineInstance = owner.buildChildEngineInstance(engineName);
    engineInstance.boot();

    let template = engineInstance.lookup('template:application');
    let controller = engineInstance.lookup('controller:application');
    let ViewClass = engineInstance._lookupFactory('view:application');

    let renderOptions = {
      owner: engineInstance,
      into: options && options.into && options.into.replace(/\//g, '.'),
      outlet: (options && options.outlet) || 'main',
      template,
      controller,
      ViewClass
    };

    this.connections.push(renderOptions);

    run.once(this.router, '_setOutlets');
  },

  transitionTo(_routeName, ...args) {
    let routeName = _routeName;
    let owner = getOwner(this);
    let prefix = owner.mountPoint;

    if (owner.routeable) {
      if (resemblesURL(routeName)) {
        throw new EmberError('Route#transitionTo cannot be used for URLs. Please use the route name instead.');
      } else {
        routeName = `${prefix}.${_routeName}`;
      }
    }

    return this._super(routeName, ...args);
  }
});

function resemblesURL(str) {
  return typeof str === 'string' && ( str === '' || str.charAt(0) === '/');
}
