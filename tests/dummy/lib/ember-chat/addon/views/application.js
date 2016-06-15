import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    console.log('ChatEngine.ApplicationView - init');
    this._super(...arguments);
  },

  willRender() {
    console.log('ChatEngine.ApplicationView - willRender');
    this._super(...arguments);
  },

  click() {
    console.log('what?');
  }
});
