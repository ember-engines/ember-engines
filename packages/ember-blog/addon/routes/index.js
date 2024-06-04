import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class IndexRoute extends Route {
  @service router;

  @action goToPostWithChinese() {
    this.router.transitionTo('post', 1, { queryParams: { lang: 'Chinese' } });
  };
}
