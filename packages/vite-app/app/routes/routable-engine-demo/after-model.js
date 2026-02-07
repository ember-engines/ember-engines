import Route from '@ember/routing/route';
import * as emberService from '@ember/service';
const service = emberService.service ?? emberService.inject;

export default class AfterModelRoute extends Route {
  @service router;

  afterModel(model) {
    this.router.replaceWith('blog.post', model.id, {
      queryParams: { lang: 'English' },
    });
  }
}
