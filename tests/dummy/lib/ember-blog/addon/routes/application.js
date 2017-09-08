import Ember from 'ember';

export default Ember.Route.extend({
  exampleService: Ember.inject.service(),

  model() {
    // cause a service to be instantiated, so that our tests can
    // confirm that it gets cleaned up
    this.get('exampleService');

    // eslint-disable-next-line
    console.log('ember-chat.application route model hook');
    return {
      name: 'Derek Zoolander',
    };
  },
});
