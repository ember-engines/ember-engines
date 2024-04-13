import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service router;

  @action goAway() {
    this.router.transitionTo('post', 1);
  }

  @action goAwayViaURL() {
    this.router.transitionTo('/post/1');
  }
}
