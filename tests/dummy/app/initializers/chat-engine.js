import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

let ChatEngine = Ember.Engine.extend({
  buildRegistry(namespace) {
    let registry = this._super(...arguments);

    registry.register('view:application', ChatEngine.ApplicationView);
    registry.register('controller:application', ChatEngine.ApplicationController);
    registry.register('component:hello-world', ChatEngine.HelloWorldComponent);

    return registry;
  },

  Resolver: Ember.DefaultResolver.extend({
    resolveTemplate: function(parsedName) {
      console.log('Engine - resolveTemplate', parsedName);

      switch (parsedName.fullNameWithoutType) {
        case 'application':
          return Ember.HTMLBars.compile(`Chat-application: <div>{{hello-world}}</div>`);
          //return Ember.HTMLBars.compile(`Chat-application: <div>{{outlet}}</div>`);

        case 'index':
          return Ember.HTMLBars.compile(`Chat-index: <div>{{outlet}}</div>`);
      }

      return this._super(...arguments);
    }
  })
});

ChatEngine.ApplicationView = Ember.Component.extend({
  init() {
    console.log('ChatEngine.ApplicationView - init');
    this._super(...arguments);
  },
  willRender() {
    console.log('ChatEngine.ApplicationView - willRender');
    this._super(...arguments);
  }
});

ChatEngine.ApplicationController = Ember.Controller.extend();

ChatEngine.HelloWorldComponent = Ember.Component.extend({
  layout: hbs`<h2>{{title}}</h2>`,

  attrs: {
    title: 'Hello'
  }
});


export function initialize(application) {
  application.register('engine:chat', ChatEngine);

  // TODO-remove
  application.register('component:hello-world', ChatEngine.HelloWorldComponent);
}

export default {
  name: 'chat-engine',
  initialize
};
