import Controller from '@ember/controller';
import * as emberService from '@ember/service';
const service = emberService.service ?? emberService.inject;
import { action } from '@ember/object';

export default class IndexRouteController extends Controller {
  @service router;

  @action goToPostWithChinese() {
    this.router.transitionTo('post', 1, { queryParams: { lang: 'Chinese' } });
  };
}
