import Ember from 'ember';

const {
  Route,
  getOwner,
  run
} = Ember;

Route.reopen({
  mount(engine, options) {
    console.log('mount', options);

    let owner = getOwner(this);

    let Engine = owner.lookup(`engine:${engine}`);

    let engineInstance = Engine.buildInstance();

    engineInstance.boot({parent: owner});

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

    if (resemblesURL(routeName)) {
      // avoid creating double slashes
      if (routeName.charAt(0) === '/') {
        routeName = `/${prefix}${_routeName}`;
      } else {
        routeName = `/${prefix}`;
      }
    } else {
      routeName = `${prefix}.${_routeName}`;
    }

    return this._super(routeName, ...args);
  }
});

function resemblesURL(str) {
  return typeof str === 'string' && ( str === '' || str.charAt(0) === '/');
}
