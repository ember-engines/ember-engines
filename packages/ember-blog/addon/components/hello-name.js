import Component from '@glimmer/component';
import { runTask } from 'ember-lifeline';
import { localCopy } from 'tracked-toolbox';

export default class HelloName extends Component {
  @localCopy('args.name') name;

  constructor() {
    super(...arguments);

    runTask(
      this,
      () => {
        this.name = 'Jerry';
      },
      50
    );
  }
}
