import { later, cancel } from '@ember/runloop';
import Component from '@ember/component';
import layout from '../templates/components/hello-name';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),
  layout: layout,
  classNames: ['hello-name'],
  init() {
    this._super(...arguments);
    this._later = later(() => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      this.set('name', 'Jerry');
    }, 50);
  },
  destroy() {
    cancel(this._later);
    this._super(...arguments);
  },
  actions: {
    something() {
      this.router.transitionToExternal('home')
    }
  }
});
