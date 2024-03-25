import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class PostRoute extends Route {
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
    this.transitionToExternal('home').then(() => {
      var postController = this.controllerFor(this.routeName);
      postController.set('transitionedToExternal', true);
    });
  }

  @action replaceWithHome() {
    this.replaceWithExternal('home').then(() => {
      var postController = this.controllerFor(this.routeName);
      postController.set('replacedWithExternal', true);
    });
  };
}
