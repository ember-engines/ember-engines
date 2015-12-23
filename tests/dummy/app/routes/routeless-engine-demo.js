import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate() {
    this._super(...arguments);

    console.log('renderTemplate');

    // Mount the chat engine in the sidebar
    this.mount('ember-chat', {
      into: 'routeless-engine-demo',
      outlet: 'sidebar'
    });
  }
});
