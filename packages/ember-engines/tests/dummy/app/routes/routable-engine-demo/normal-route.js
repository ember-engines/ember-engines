import Route from '@ember/routing/route';
import * as emberService from '@ember/service';
const service = emberService.service ?? emberService.inject;

export default class NormalRoute extends Route {
  @service router;

  beforeModel() {
    return this.router.transitionTo('routeless-engine-demo');
  }
}
