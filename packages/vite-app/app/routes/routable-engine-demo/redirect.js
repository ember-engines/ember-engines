import Route from '@ember/routing/route';
import * as emberService from '@ember/service';
const service = emberService.service ?? emberService.inject;

export default class RedirectRoute extends Route {
  @service router;
  redirect() {
    this.router.replaceWith('blog.post', 1, {
      queryParams: { lang: 'English' },
    });
  }
}
