import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AfterModelRoute extends Route {
  @service router;

  afterModel(model) {
    this.router.replaceWith('blog.post', model.id, {
      queryParams: { lang: 'English' }
    });
  }
}
