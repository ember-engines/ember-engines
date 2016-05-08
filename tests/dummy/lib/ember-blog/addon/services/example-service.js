import Ember from 'ember';

export default Ember.Service.extend({
  dataStore: Ember.inject.service(),
  init() {
    // The store is provided by the containing application, so it's a convenient rendezvous point for our tests to be able to observe this instance.
    this.get('dataStore').__exampleServiceForTesting = this;
  }
});
