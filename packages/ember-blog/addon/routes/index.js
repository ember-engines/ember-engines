import Route from '@ember/routing/route';

export default Route.extend({
  actions: {
    goToPostWithChinese() {
      this.transitionTo('post', 1, { queryParams: { lang: 'Chinese' } });
    },
  },
});
