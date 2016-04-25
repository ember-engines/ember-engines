import Ember from 'ember';
import layout from '../templates/components/hello-name';

export default Ember.Component.extend({
  layout: layout,
  classNames: [ 'hello-name' ],
  init() {
    this._super(...arguments);
    Ember.run.later(() => this.set('name', 'Jerry'), 500);
  }
});
