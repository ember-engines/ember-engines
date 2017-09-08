import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    goToPostWithChinese() {
      this.transitionTo('blog.post', 1, { queryParams: { lang: 'Chinese' } });
    },
  },
});
