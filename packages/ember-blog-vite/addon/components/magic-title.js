import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MagicTitleComponent extends Component {
  @tracked title = 'Hello World';

  @action
  updateTitle() {
    this.title = 'This is Magic';
  }
}
