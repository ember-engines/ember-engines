import { service } from '@ember/service';
import Controller from '@ember/controller';

let count = 0;

export default class EmberChatApplicationController extends Controller {
  name = `ember-chat-vite-${++count}`;
  @service exampleService;

  constructor() {
    super(...arguments);
    this.exampleService;
  }
}
