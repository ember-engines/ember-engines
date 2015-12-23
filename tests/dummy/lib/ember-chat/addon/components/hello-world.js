import Ember from 'ember';
import layout from '../templates/components/hello-world';

export default Ember.Component.extend({
  layout: layout,

  name: null,

  init() {
    this._super(...arguments);

    console.log('hello-world.init');
  },

  click() {
    console.log('hello-world click');
  }
});
