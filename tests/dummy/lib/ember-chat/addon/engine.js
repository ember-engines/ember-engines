import Ember from 'ember';
import Resolver from 'ember-resolver';

export default Ember.Engine.extend({
  modulePrefix: 'ember-chat',

  Resolver,

  dependencies: {
    services: [
      'store'
    ]
  }
});
