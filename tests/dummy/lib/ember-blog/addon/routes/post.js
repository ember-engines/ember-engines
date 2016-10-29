import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    console.log('ember-blog.post route model hook', params);
    return {
      user: this.modelFor('application'),
      id: params.id,
      title: `Post ${params.id}`
    };
  },

  actions: {
    goToChineseVersion() {
      this.transitionTo({ queryParams: { lang: 'Chinese' } });
    },

    loading() {
      // Manually invoking the loading route since loading states
      // do not currently work properly. Should fix soon.
      this.intermediateTransitionTo('post.loading');
    }
  }
});
