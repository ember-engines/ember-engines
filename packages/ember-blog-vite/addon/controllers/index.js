import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class IndexRouteController extends Controller {
  @service router;

  @action goToPostWithChinese() {
    this.router.transitionTo('post', 1, { queryParams: { lang: 'Chinese' } });
  };
}
