import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

let count = 0;

export default class EmberChatApplicationController extends Controller {
  name = 'ember-chat';
  @service exampleService;

  init() {
    super.init(...arguments);
    this.get('exampleService');
    this.set('name', `ember-chat-${++count}`);
  }
}
