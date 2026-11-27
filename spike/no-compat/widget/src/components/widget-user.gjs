import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class WidgetUser extends Component {
  @service session;

  <template>
    <span data-test-widget-user>{{this.session.user}}</span>
  </template>
}
