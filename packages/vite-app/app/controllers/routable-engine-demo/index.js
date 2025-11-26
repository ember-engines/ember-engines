import Controller from '@ember/controller';
import { action } from '@ember/object';
import * as emberService from '@ember/service';
const service = emberService.service ?? emberService.inject;

export default class RoutableEngineDemoIndexController extends Controller {
  @service router;

  @action
  goToPostWithChinese() {
    this.router.transitionTo('blog.post', 1, {
      queryParams: { lang: 'Chinese' },
    });
  }
}
