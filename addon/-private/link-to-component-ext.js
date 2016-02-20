import Ember from 'ember';

const {
  LinkComponent,
  getOwner,
  get,
  set
} = Ember;

LinkComponent.reopen({
  willRender() {
    this._super(...arguments);

    let owner = getOwner(this);

    if (owner.mountPoint) {
      let targetRouteName = get(this, 'targetRouteName');
      if (!targetRouteName.isGlobalUrl) {
        let fullRouteName = owner.mountPoint + '.' + targetRouteName;
        set(this, 'targetRouteName', fullRouteName);
      } else {
        set(this, 'targetRouteName', targetRouteName.toString());
      }
    }
  }
});
