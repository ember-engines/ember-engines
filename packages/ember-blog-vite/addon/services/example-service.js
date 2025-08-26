import Service, { service } from '@ember/service';

export default class ExampleService extends Service {
  @service dataStore;

  init() {
    super.init(...arguments);
    // The store is provided by the containing application, so it's a convenient rendezvous point for our tests to be able to observe this instance.
    this.dataStore.__exampleServiceForTesting = this;
  }
}
