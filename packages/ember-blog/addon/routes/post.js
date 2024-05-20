import Route from '@ember/routing/route';
import { action } from '@ember/object';
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

  @action goToChineseVersion() {
    this.transitionTo({ queryParams: { lang: 'Chinese' } });
  }

  @action transitionToHome() {
    this.router.transitionToExternal('home').then(() => {
      var postController = this.controllerFor(this.routeName);
      postController.set('transitionedToExternal', true);
    });
  }

  @action replaceWithHome() {
    this.router.replaceWithExternal('home').then(() => {
      var postController = this.controllerFor(this.routeName);
      postController.set('replacedWithExternal', true);
    });
  };
}
