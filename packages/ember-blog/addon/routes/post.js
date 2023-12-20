import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PostRoute extends Route {
  @service router;

  model(params) {
    return {
      user: this.modelFor('application'),
      id: params.id,
      title: `Post ${params.id}`
    };
  }

  actions = {
    goToChineseVersion() {
      this.router.transitionTo('post', this.controller.model.id, {
        queryParams: { lang: 'Chinese' }
      });
    },
    transitionToHome() {
      this.router.transitionToExternal('home').then(() => {
        var postController = this.controllerFor(this.routeName);
        postController.set('transitionedToExternal', true);
      });
    },
    replaceWithHome() {
      this.router.replaceWithExternal('home').then(() => {
        var postController = this.controllerFor(this.routeName);
        postController.set('replacedWithExternal', true);
      });
    }
  };
}
