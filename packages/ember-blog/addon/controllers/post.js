import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set, get, action } from '@ember/object';

export default class PostController extends Controller {
  queryParams = ['lang'];

  @service router;

  @action
  transitionToHomeFromController() {
    this.transitionToExternalRoute('home').then(() => {
      this.transitionedToExternalRoute = true;
    });
  }
  @action
  transitionToHomeByService() {
    this.router.transitionToExternal('home').then(() => {
      this.transitionToExternal = true;
    });
  }

  @action
  replaceWithHomeByService() {
    this.router.replaceWithExternal('home').then(() => {
      this.replaceWithExternal = true;
    });
  }

  @action
  copyPostURL() {
    const url = this.router.urlForExternal('home');
    this.urlForExternal = url;
    // Clipboard now has "/"
  }

  @action
  checkActiveState() {
    if (this.router.isActiveExternal('home')) {
      this.isActiveExternal = true;
    }
  }
}
