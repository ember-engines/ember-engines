import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

let count = 0;

export default Controller.extend({
  name: 'ember-chat',
  exampleService: service(),
  init() {
    this._super(...arguments);
    this.get('exampleService');

    // eslint-disable-next-line
    console.log('ember-chat application controller init');

    this.set('name', `ember-chat-${++count}`);
  },
});
