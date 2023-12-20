import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';

export default class PostController extends Controller {
  @service router;
  queryParams = ['lang'];
  commentsRoute = 'post.comments'; // Added to demonstrate that dynamic route names work

  actions = {
    transitionToHomeFromController() {
      this.router.transitionToExternal('home').then(() => {
        set(this, 'transitionedToExternalRoute', true);
      });
    }
  };
}
