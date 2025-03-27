import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class NewRouteController extends Controller {
  @service router;

  @action goAway() {
    this.router.transitionTo('post', 1);
  }

  @action goAwayViaURL() {
    this.router.transitionTo('/post/1');
  }
}
