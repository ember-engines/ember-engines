import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service router;

  actions = {
    goAway() {
      this.router.transitionTo('post', 1);
    },

    goAwayViaURL() {
      this.router.transitionTo('/post/1');
    }
  };
}
