import Ember from 'ember';

const {
  LinkComponent,
  getOwner,
  get,
  set
} = Ember;

export default LinkComponent.extend({
  willRender() {
    this._super(...arguments);

    let owner = getOwner(this);
    let fullRouteName = owner.mountPoint + '.' + get(this, 'targetRouteName');

    set(this, 'targetRouteName', fullRouteName);
  }
});
