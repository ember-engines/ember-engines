import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class SessionUser extends Component {
  @service session;

  <template>{{this.session.user}}</template>
}
