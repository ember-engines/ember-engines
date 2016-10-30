import Ember from 'ember';

const { RSVP } = Ember;

export default Ember.Route.extend({
  model() {
    return RSVP.reject(new Error('Nope!'));
  }
});
