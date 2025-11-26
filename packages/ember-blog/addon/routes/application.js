import * as emberService from '@ember/service';
const service = emberService.service ?? emberService.inject;
import Route from '@ember/routing/route';

export default class EmberBlogApplicationRoute extends Route {
  @service exampleService;

  model() {
    // cause a service to be instantiated, so that our tests can
    // confirm that it gets cleaned up
    this.exampleService;

    return {
      name: 'Derek Zoolander',
    };
  }
}
