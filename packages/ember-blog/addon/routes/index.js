import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;

  @action goToPostWithChinese() {
    this.router.transitionTo('post', 1, { queryParams: { lang: 'Chinese' } });
  };
}
