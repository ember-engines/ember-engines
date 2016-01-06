import Ember from 'ember';
import Resolver from 'ember-resolver';

export default Ember.Engine.extend({
  modulePrefix: 'ember-blog',

  Resolver,

  dependencies: {
    services: [
      'data-store'
    ]
  }
});
