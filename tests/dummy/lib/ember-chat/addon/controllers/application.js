import Ember from 'ember';

let count = 0;

export default Ember.Controller.extend({
  name: 'ember-chat',
  init() {
    console.log('ember-chat application controller init');
    this.set('name', `ember-chat-${++count}`);
    this._super(...arguments);
  },
});
