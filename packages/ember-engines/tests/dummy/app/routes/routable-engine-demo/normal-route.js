import Route from '@ember/routing/route';

export default class NormalRoute extends Route {
  beforeModel() {
    return this.transitionTo('routeless-engine-demo');
  }
}
