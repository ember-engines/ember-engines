import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
