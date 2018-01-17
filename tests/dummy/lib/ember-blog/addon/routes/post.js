import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return {
      user: this.modelFor('application'),
      id: params.id,
      title: `Post ${params.id}`,
    };
  },

  actions: {
    goToChineseVersion() {
      this.transitionTo({ queryParams: { lang: 'Chinese' } });
    },
    transitionToHome() {
      this.transitionToExternal('home').then(() => {
        var postController = this.controllerFor(this.routeName);
        postController.set('transitionedToExternal', true);
      });
    },
    replaceWithHome() {
      this.replaceWithExternal('home').then(() => {
        var postController = this.controllerFor(this.routeName);
        postController.set('replacedWithExternal', true);
      });
    },
  },
});
