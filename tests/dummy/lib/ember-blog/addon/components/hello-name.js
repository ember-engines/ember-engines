import Ember from 'ember';
import layout from '../templates/components/hello-name';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['hello-name'],
  init() {
    this._super(...arguments);
    Ember.run.later(() => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      this.set('name', 'Jerry');
    }, 500);
  },
});
