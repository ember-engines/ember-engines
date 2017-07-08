import Ember from 'ember';

let count = 0;

export default Ember.Controller.extend({
  name: 'ember-chat',
  exampleService: Ember.inject.service(),
  init() {
    this._super(...arguments);
    this.get('exampleService');

    console.log('ember-chat application controller init');

    this.set('name', `ember-chat-${++count}`);
  },
});
