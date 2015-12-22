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
    let view = engineInstance.lookup('view:application');

    let renderOptions = {
      owner: engineInstance,
      into: options && options.into && options.into.replace(/\//g, '.'),
      outlet: (options && options.outlet) || 'main',
      template,
      controller,
      view
    };

    this.connections.push(renderOptions);

    run.once(this.router, '_setOutlets');
  }
});
