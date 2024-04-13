import Controller from '@ember/controller';
import { set, action } from '@ember/object';

export default class PostController extends Controller {
  queryParams = ['lang'];
  commentsRoute = 'post.comments'; // Added to demonstrate that dynamic route names work

  @action transitionToHomeFromController() {
    this.transitionToExternalRoute('home').then(() => {
      set(this, 'transitionedToExternalRoute', true);
    });
  };
}
