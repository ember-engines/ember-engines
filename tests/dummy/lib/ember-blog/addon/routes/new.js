import Route from '@ember/routing/route';

export default Route.extend({
  actions: {
    goAway() {
      this.transitionTo('post', 1);
    },

    goAwayViaURL() {
      this.transitionTo('/post/1');
    },
  },
});
