import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class HelloWorld extends Component {
  @tracked clickCount = 0;

  @action onClick() {
    this.clickCount++;
  }
}
