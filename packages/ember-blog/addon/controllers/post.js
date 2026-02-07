import Controller from '@ember/controller';
import * as emberService from '@ember/service';
const service = emberService.service ?? emberService.inject;
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PostController extends Controller {
  @service router;

  queryParams = ['lang'];
  commentsRoute = 'post.comments'; // Added to demonstrate that dynamic route names work

  @tracked transitionedToExternalRoute = false

  @action goToChineseVersion() {
    this.router.transitionTo('post', this.model.id, { queryParams: { lang: 'Chinese' } });
  }

  @action transitionToHome() {
    this.router.transitionToExternal('home').then(() => {
      this.set('transitionedToExternal', true);
    });
  }

  @action transitionToHomeFromController() {
    this.router.transitionToExternal('home').then(() => {
      this.transitionedToExternalRoute = true;
    });
  };

  @action replaceWithHome() {
    this.router.replaceWithExternal('home').then(() => {
      this.set('replacedWithExternal', true);
    });
  };
}
