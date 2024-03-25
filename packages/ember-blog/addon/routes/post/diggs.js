import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class DiggsRoute extends Route {
  model() {
    return RSVP.reject(new Error('Nope!'));
  }
}
