import { later, cancel } from '@ember/runloop';
import Component from '@ember/component';
import layout from '../templates/components/hello-name';

export default class HelloName extends Component {
  layout = layout;
  classNames = ['hello-name'];

  init() {
    super.init(...arguments);
    this._later = later(() => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      this.set('name', 'Jerry');
    }, 50);
  }

  destroy() {
    cancel(this._later);
    super.destroy(...arguments);
  }
}
