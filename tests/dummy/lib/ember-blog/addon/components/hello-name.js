import { later } from '@ember/runloop';
import Component from '@ember/component';
import layout from '../templates/components/hello-name';

export default Component.extend({
  layout: layout,
  classNames: ['hello-name'],
  init() {
    this._super(...arguments);
    later(() => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      this.set('name', 'Jerry');
    }, 500);
  },
});
