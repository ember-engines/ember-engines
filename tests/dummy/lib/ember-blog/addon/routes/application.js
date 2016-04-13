import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    console.log('ember-chat.application route model hook');
    return {
      name: 'Derek Zoolander'
    };
  }
});
