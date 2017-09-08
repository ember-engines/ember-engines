import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    // eslint-disable-next-line
    console.log('ember-chat.new route model hook');
  },

  actions: {
    goAway() {
      this.transitionTo('post', 1);
    },

    goAwayViaURL() {
      this.transitionTo('/post/1');
    },
  },
});
