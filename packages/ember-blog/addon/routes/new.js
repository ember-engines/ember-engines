import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class NewRoute extends Route {
  @action goAway() {
    this.transitionTo('post', 1);
  }

  @action goAwayViaURL() {
    this.transitionTo('/post/1');
  }
}
