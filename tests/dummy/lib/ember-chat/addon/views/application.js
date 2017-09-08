import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    // eslint-disable-next-line
    console.log('ChatEngine.ApplicationView - init');
    this._super(...arguments);
  },

  willRender() {
    // eslint-disable-next-line
    console.log('ChatEngine.ApplicationView - willRender');
    this._super(...arguments);
  },

  click() {
    // eslint-disable-next-line
    console.log('what?');
  },
});
