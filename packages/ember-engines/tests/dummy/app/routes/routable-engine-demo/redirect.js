import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class RedirectRoute extends Route {
  @service router;
  redirect() {
    this.router.replaceWith('blog.post', 1, {
      queryParams: { lang: 'English' },
    });
  }
}
