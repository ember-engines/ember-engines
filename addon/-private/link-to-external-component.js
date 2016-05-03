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

    const owner = getOwner(this);
    const targetRouteName = get(this, 'targetRouteName');
    const externalRoute = owner._getExternalRoute(targetRouteName);
    set(this, 'targetRouteName', externalRoute);
  }
});
