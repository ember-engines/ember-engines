import Component from '@glimmer/component';
import { service } from '@ember/service';

// Like HDS components: the service is looked up by name on whichever owner
// renders the component, so an engine needs its own registration.
export default class UiGreeting extends Component {
  @service('ui-intl') intl;

  <template>
    <span data-test-ui-greeting data-instance={{this.intl.instance}}>{{this.intl.t "hello"}}</span>
  </template>
}
