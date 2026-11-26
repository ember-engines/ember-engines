import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ItemController extends Controller {
  queryParams = ['tab'];
  @tracked tab = 'overview';
}
