import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class IndexRoute extends Route {
  @action goToPostWithChinese() {
    this.transitionTo('post', 1, { queryParams: { lang: 'Chinese' } });
  };
}
