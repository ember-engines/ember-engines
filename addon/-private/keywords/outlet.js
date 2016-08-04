import emberRequire from '../ext-require';
const outlet = emberRequire('ember-htmlbars/keywords/outlet');
const ViewNodeManager = emberRequire('ember-htmlbars/node-managers/view-node-manager');

outlet.childEnv = function(state, env) {
  let outletState = state.outletState;
  let toRender = outletState && outletState.render;
  let meta = toRender && toRender.template && toRender.template.meta;

  let childEnv = env.childWithOutletState(outletState && outletState.outlets, true, meta);

  let owner = outletState && outletState.render && outletState.render.owner;
  if (owner && owner !== childEnv.owner) {
    childEnv.originalOwner = childEnv.owner;
    childEnv.owner = owner;
  }

  return childEnv;
};

outlet.render = function(renderNode, env, scope, params, hash, _template, inverse, visitor) {
  let state = renderNode.getState();
  let owner = env.owner;
  let parentView = env.view;
  let outletState = state.outletState;
  let toRender = outletState.render;


  let ViewClass = outletState.render.ViewClass;

  owner = env.originalOwner || owner;

  if (!state.hasParentOutlet && !ViewClass) {
    ViewClass = owner._lookupFactory('view:toplevel');
  }

  let attrs = {};
  let options = {
    component: ViewClass,
    self: toRender.controller,
    createOptions: {
      controller: toRender.controller
    }
  };

  let template = _template || toRender.template && toRender.template.raw;

  if (state.manager) {
    state.manager.destroy();
    state.manager = null;
  }

  // detect if we are crossing into an engine
  if (env.originalOwner) {
    // when this outlet represents an engine we must ensure that a `ViewClass` is present
    // even if the engine does not contain a `view:application`. We need a `ViewClass` to
    // ensure that an `ownerView` is set on the `env` created just above
    options.component = options.component || owner._lookupFactory('view:toplevel');
  }

  let nodeManager = ViewNodeManager.create(renderNode, env, attrs, options, parentView, null, null, template);
  state.manager = nodeManager;

  nodeManager.render(env, hash, visitor);
};
