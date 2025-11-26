import Route from '@ember/routing/route';
import * as emberService from '@ember/service';
const service = emberService.service ?? emberService.inject;

export default class PostRoute extends Route {
  @service router;

  model(params) {
    return {
      user: this.modelFor('application'),
      id: params.id,
      title: `Post ${params.id}`
    };
  }
}
