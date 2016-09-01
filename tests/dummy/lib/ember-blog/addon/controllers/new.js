import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    goAwayViaController() {
      this.transitionToRoute('post', 1);
    }
  }
});
