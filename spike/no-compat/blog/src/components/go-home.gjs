import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';

// Uses the engine's router service, which the base class registers.
export default class GoHome extends Component {
  @service router;

  goHome = () => this.router.transitionToExternal('home');

  <template>
    <button type="button" data-test-go-home {{on "click" this.goHome}}>Go home</button>
  </template>
}
