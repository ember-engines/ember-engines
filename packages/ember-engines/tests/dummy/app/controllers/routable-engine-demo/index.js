import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class RoutableEngineDemoIndexController extends Controller {
  @service router;

  @action
  goToPostWithChinese() {
    this.router.transitionTo('blog.post', 1, {
      queryParams: { lang: 'Chinese' },
    });
  }
}
