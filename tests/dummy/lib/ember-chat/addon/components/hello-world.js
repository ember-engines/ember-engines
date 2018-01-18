import Component from '@ember/component';
import layout from '../templates/components/hello-world';

export default Component.extend({
  layout: layout,

  name: null,

  init() {
    this._super(...arguments);
    this.set('clickCount', 0);
  },

  actions: {
    click() {
      this.incrementProperty('clickCount');
    },
  },
});
