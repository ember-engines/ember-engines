import { later } from '@ember/runloop';
import Route from '@ember/routing/route';
import { Promise } from 'rsvp';

export default class LikesRoute extends Route {
  model() {
    return new Promise(resolve => later(resolve, 13 /* to try to happen after all auto-runs */));
  }
}
