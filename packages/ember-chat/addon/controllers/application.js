import * as emberService from '@ember/service';
const service = emberService.service ?? emberService.inject;
import Controller from '@ember/controller';

let count = 0;

export default class EmberChatApplicationController extends Controller {
  name = `ember-chat-${++count}`;
  @service exampleService;

  constructor() {
    super(...arguments);
    this.exampleService;
  }
}
