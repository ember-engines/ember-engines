import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    console.log('ember-chat.new route model hook');
  },

  actions: {
    goAway() {
      this.transitionTo('post', 1);
    },

    goAwayViaIntermediate() {
      this.intermediateTransitionTo('transient-route');
    },

    goAwayViaURL() {
      this.transitionTo('/post/1');
    }
  }
});
