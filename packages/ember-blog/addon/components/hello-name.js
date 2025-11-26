import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
export default class HelloName extends Component {
  @tracked name = this.args.name;

  constructor() {
    super(...arguments);
    queueMicrotask(() => {
      this.name = 'Jerry';
    });
  }
}
