import Ember from 'ember';

const {
  Router: EmberRouter,
  RouterDSL: EmberRouterDSL,
  get,
  Logger,
  getOwner
} = Ember;

EmberRouter.reopen({
  _buildDSL() {
    let owner = getOwner(this);
    let moduleBasedResolver = this._hasModuleBasedResolver();

    return new EmberRouterDSL(null, {
      enableLoadingSubstates: !!moduleBasedResolver,
      resolveRouteMap(name) {
        return owner._lookupFactory('route-map:' + name);
      }
    });
  }
});
