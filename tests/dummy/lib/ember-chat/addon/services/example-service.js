import Service, { inject as service } from '@ember/service';

export default Service.extend({
  store: service(),
  init() {
    this._super(...arguments);
    // The store is provided by the containing application, so it's a convenient rendezvous point for our tests to be able to observe this instance.
    this.get('store').__exampleServiceForTesting = this;
  },
});
