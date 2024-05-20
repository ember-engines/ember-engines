import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PostController extends Controller {
  @service router;

  queryParams = ['lang'];
  commentsRoute = 'post.comments'; // Added to demonstrate that dynamic route names work

  @tracked transitionedToExternalRoute = false

  @action transitionToHomeFromController() {
    this.router.transitionToExternalRoute('home').then(() => {
      this.transitionedToExternalRoute = true;
    });
  };
}
