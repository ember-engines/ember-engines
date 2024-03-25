import Component from '@ember/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import layout from '../templates/components/hello-world';

export default class HelloWorld extends Component {
  layout = layout;
  name = null;
  @tracked clickCount = 0;

  @action onClick() {
    this.clickCount++;
  }
}
