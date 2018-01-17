import { later } from '@ember/runloop';
import Route from '@ember/routing/route';
import { Promise } from 'rsvp';

export default Route.extend({
  model() {
    return new Promise(resolve => {
      later(() => {
        resolve();
      }, 500);
    });
  },
});
