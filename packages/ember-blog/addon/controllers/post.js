import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PostController extends Controller {
  queryParams = ['lang'];
  commentsRoute = 'post.comments'; // Added to demonstrate that dynamic route names work

  @tracked transitionedToExternalRoute = false

  @action transitionToHomeFromController() {
    this.transitionToExternalRoute('home').then(() => {
      this.transitionedToExternalRoute = true;
    });
  };
}
