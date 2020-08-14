import Route from '@ember/routing/route';

export default Route.extend({
  actions: {
    goToPostWithChinese() {
      this.transitionTo('blog.post', 1, { queryParams: { lang: 'Chinese' } });
    },
  },
});
