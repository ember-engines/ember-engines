import Ember from 'ember';
import emberRequire from '../ext-require';
const outlet = emberRequire('ember-htmlbars/keywords/outlet');
const isEnabled = emberRequire('ember-metal/features');
const ViewNodeManager = emberRequire('ember-htmlbars/node-managers/view-node-manager');
const info = emberRequire('ember-metal/debug', 'info');

const {
  get
} = Ember;

const outletChildEnv = outlet.childEnv;
outlet.childEnv = function(state) {
  let childEnv = outletChildEnv.apply(this, arguments);
  let outletState = state.outletState;
  let owner = outletState && outletState.render.owner;

  if (owner !== childEnv.owner) {
    childEnv.originalOwner = childEnv.owner;
    childEnv.owner = owner;
  }

  return childEnv;
};

outlet.render = function(renderNode, _env, scope, params, hash, template, inverse, visitor) {
  let env = _env;
  var state = renderNode.getState();
  var parentView = env.view;
  var outletState = state.outletState;
  var toRender = outletState.render;
  var owner = env.originalOwner || env.owner;
  var namespace = owner.lookup('application:main');
  var LOG_VIEW_LOOKUPS = get(namespace, 'LOG_VIEW_LOOKUPS');

  var ViewClass = outletState.render.ViewClass;

  if (!state.hasParentOutlet && !ViewClass) {
    ViewClass = owner._lookupFactory('view:toplevel');
  }

  var Component;

  if (isEnabled('ember-routing-routable-components')) {
    Component = outletState.render.Component;
  }

  var options;
  var attrs = {};
  if (Component) {
    options = {
      component: Component
    };
    attrs = toRender.attrs;
  } else {
    options = {
      component: ViewClass,
      self: toRender.controller,
      createOptions: {
        controller: toRender.controller
      }
    };

    template = template || toRender.template && toRender.template.raw;

    if (LOG_VIEW_LOOKUPS && ViewClass) {
      info('Rendering ' + toRender.name + ' with ' + ViewClass, { fullName: 'view:' + toRender.name });
    }
  }

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

  var nodeManager = ViewNodeManager.create(renderNode, env, attrs, options, parentView, null, null, template);
  state.manager = nodeManager;

  if (!env.view) {
    env.view = nodeManager.component;
  }

  nodeManager.render(env, hash, visitor);
};
