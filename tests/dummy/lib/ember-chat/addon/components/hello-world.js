import Ember from 'ember';
import layout from '../templates/components/hello-world';

export default Ember.Component.extend({
  layout: layout,

  name: null,

  init() {
    console.log('hello-world.init');
    this._super(...arguments);
  },

  click() {
    console.log('hello-world click');
  }
});
