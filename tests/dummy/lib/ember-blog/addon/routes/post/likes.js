import Ember from 'ember';

const { RSVP: { Promise } } = Ember;

export default Ember.Route.extend({
  model() {
    return new Promise(resolve => {
      Ember.run.later(() => {
        resolve();
      }, 500);
    });
  },
});
