import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set, get, action } from '@ember/object';

export default class PostController extends Controller {
  queryParams = ['lang'];

  @service router;

  @action
  transitionToHomeFromController() {
    this.transitionToExternalRoute('home').then(() => {
      set(this, 'transitionedToExternalRoute', true);
    });
  }
  @action
  transitionToHomeByService() {
    get(this, 'router').transitionToExternal('home').then(() => {
      set(this, 'transitionToExternal', true);
    });
  }

  @action
  replaceWithHomeByService() {
    get(this, 'router').replaceWithExternal('home').then(() => {
      set(this, 'replaceWithExternal', true);
    });
  }

  @action
  copyPostURL() {
    const url = get(this, 'router').urlForExternal('home');
    set(this, 'urlForExternal', url);
    // Clipboard now has "/"
  }

  @action
  checkActiveState() {
    if (get(this, 'router').isActiveExternal('home')) {
      set(this, 'isActiveExternal', true);
    }
  }
}
