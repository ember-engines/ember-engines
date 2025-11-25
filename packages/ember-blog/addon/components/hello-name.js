import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
export default class HelloName extends Component {
  @tracked name;

  updateName = () => {
    queueMicrotask(() => {
      this.name = 'Jerry';
    });
  }
}
