import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    goToPostWithChinese() {
      this.transitionTo('post', 1, { queryParams: { lang: 'Chinese' } });
    },
  },
});
