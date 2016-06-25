import Ember from 'ember';
import layout from '../templates/components/hello-world';

export default Ember.Component.extend({
  layout: layout,

  name: null,

  init() {
    this._super(...arguments);
    this.set('clickCount', 0);

    console.log('hello-world.init');
  },

  actions: {
    click() {
      console.log('hello-world click');
      this.incrementProperty('clickCount');
    }
  }

});
