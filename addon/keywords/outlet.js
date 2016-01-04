import Ember from 'ember';
import emberRequire from '../ext-require';
const outlet = emberRequire('ember-htmlbars/keywords/outlet');
const isEnabled = emberRequire('ember-metal/features');
const ViewNodeManager = emberRequire('ember-htmlbars/node-managers/view-node-manager');
const RenderEnv = emberRequire('ember-htmlbars/system/render-env');
const info = emberRequire('ember-metal/debug', 'info');

const {
  get
} = Ember;


outlet.render = function(renderNode, _env, scope, params, hash, template, inverse, visitor) {
  let env = _env;
  var state = renderNode.getState();
  var parentView = env.view;
  var outletState = state.outletState;
  var toRender = outletState.render;
  var namespace = env.owner.lookup('application:main');
  var LOG_VIEW_LOOKUPS = get(namespace, 'LOG_VIEW_LOOKUPS');

  var ViewClass = outletState.render.ViewClass;

  if (!state.hasParentOutlet && !ViewClass) {
    ViewClass = env.owner._lookupFactory('view:toplevel');
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

  let owner = outletState.render.owner;
  // detect if we are crossing into an engine
  if (owner !== env.owner) {
    env = new RenderEnv({
      view: null,
      outletState: outletState.outlets,
      owner,
      renderer: _env.renderer,
      dom: _env.renderer._dom,
      meta: env.meta
    });
  }

  var nodeManager = ViewNodeManager.create(renderNode, env, attrs, options, parentView, null, null, template);
  state.manager = nodeManager;

  if (!env.view) {
    env.view = nodeManager.component;
  }

  nodeManager.render(env, hash, visitor);
};
