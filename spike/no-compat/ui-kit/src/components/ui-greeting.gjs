import Component from '@glimmer/component';
import { service } from '@ember/service';

// Like many design-system components, this looks its service up by name on
// whichever owner renders it, so an engine needs its own registration.
export default class UiGreeting extends Component {
  @service('ui-intl') intl;

  <template>
    <span data-test-ui-greeting data-instance={{this.intl.instance}}>{{this.intl.t "hello"}}</span>
  </template>
}
