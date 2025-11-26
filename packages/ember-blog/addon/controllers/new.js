import Controller from '@ember/controller';
import { action } from '@ember/object';
import * as emberService from '@ember/service';
const service = emberService.service ?? emberService.inject;

export default class NewRouteController extends Controller {
  @service router;

  @action goAway() {
    this.router.transitionTo('post', 1);
  }

  @action goAwayViaURL() {
    this.router.transitionTo('/post/1');
  }
}
