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

    let renderOptions = {
      engine: engineInstance,
      into: options && options.into && options.into.replace(/\//g, '.'),
      outlet: (options && options.outlet) || 'main',
      template
    };

    this.connections.push(renderOptions);

    run.once(this.router, '_setOutlets');
  }
});
