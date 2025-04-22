import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class NormalRoute extends Route {
  @service router;

  beforeModel() {
    return this.router.transitionTo('routeless-engine-demo');
  }
}
