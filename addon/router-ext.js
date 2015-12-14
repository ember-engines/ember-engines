import Ember from 'ember';

const {
  Router,
  getOwner
} = Ember;

Router.reopen({
  _setOutlets(options = {}) {
    this._super();

    if (options.engine) {
      let owner = getOwner(this);
    //   let engine = options.engine;
    //
    //   if (!engine._toplevelView) {
    //     let OutletView = owner._lookupFactory('view:-outlet');
    //     engine._toplevelView = OutletView.create();
    //     engine.didCreateRootView(engine._toplevelView);
    //   }
    //   // engine._toplevelView.setOutletState(liveRoutes);
    }
  }
});
