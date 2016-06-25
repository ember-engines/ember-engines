import Ember from "ember";
import emberRequire from '../ext-require';

const read = emberRequire('ember-metal/streams/utils', 'read');
const registerKeyword = emberRequire('ember-htmlbars/keywords', 'registerKeyword');
const ViewNodeManager = emberRequire('ember-htmlbars/node-managers/view-node-manager');
const RenderEnv = emberRequire('ember-htmlbars/system/render-env');
const EmptyObject = emberRequire('ember-metal/empty_object');

const {
  assert,
  getOwner
} = Ember;

registerKeyword('mount', {
  willRender(renderNode, env) {
    if (env.view.ownerView._outlets) {
      // Make sure we will get dirtied when outlet state changes.
      env.view.ownerView._outlets.push(renderNode);
    }
  },

  setupState(prevState, env, scope, params /*, hash */) {
    let name = params[0];

    assert(
      'The first argument of {{mount}} must be an engine name, e.g. {{mount "chat-engine"}}.',
      params.length === 1
    );

    assert(
      'The first argument of {{mount}} must be quoted, e.g. {{mount "chat-engine"}}.',
      typeof name === 'string'
    );

    assert(
      'You used `{{mount \'' + name + '\'}}`, but the engine \'' + name + '\' can not be found.',
      env.owner.hasRegistration(`engine:${name}`)
    );

    let engineInstance = env.owner.buildChildEngineInstance(name);

    engineInstance.boot();

    return {
      parentView: env.view,
      manager: prevState.manager,
      controller: lookupEngineController(engineInstance),
      childOutletState: childOutletState(name, env)
    };
  },

  childEnv(state, env) {
    return buildEnvForEngine(getEngineFromState(state), env);
  },

  isStable(lastState, nextState) {
    return isStable(lastState.childOutletState, nextState.childOutletState);
  },

  isEmpty(/* state */) {
    return false;
  },

  render(node, env, scope, params, hash, template, inverse, visitor) {
    let state = node.getState();

    let engineInstance = getEngineFromState(state);

    let engineController = lookupEngineController(engineInstance);

    let engineTemplate = lookupEngineTemplate(engineInstance);

    let options = {
      layout: null,
      self: engineController
    };

    let engineEnv = buildEnvForEngine(engineInstance, env);

    let nodeManager = ViewNodeManager.create(node, engineEnv, hash, options, state.parentView, null, null, engineTemplate);

    state.manager = nodeManager;

    nodeManager.render(engineEnv, hash, visitor);
  },

  rerender(node, env, scope, params /*, hash, template, inverse, visitor */) {
    let controller = node.getState().controller;
    if (controller) {
      let model = read(params[1]);
      controller.set('model', model);
    }
  }
});

function childOutletState(name, env) {
  let topLevel = env.view.ownerView;
  if (!topLevel || !topLevel.outletState) { return; }

  let outletState = topLevel.outletState;
  if (!outletState.main) { return; }

  let selectedOutletState = outletState.main.outlets['__ember_orphans__'];
  if (!selectedOutletState) { return; }
  var matched = selectedOutletState.outlets[name];
  if (matched) {
    var childState = new EmptyObject();
    childState[matched.render.outlet] = matched;
    matched.wasUsed = true;
    return childState;
  }
}

function isStable(a, b) {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  for (var outletName in a) {
    if (!isStableOutlet(a[outletName], b[outletName])) {
      return false;
    }
  }
  return true;
}

function isStableOutlet(a, b) {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  a = a.render;
  b = b.render;
  for (var key in a) {
    if (a.hasOwnProperty(key)) {
      // name is only here for logging & debugging. If two different
      // names result in otherwise identical states, they're still
      // identical.
      if (a[key] !== b[key] && key !== 'name') {
        return false;
      }
    }
  }
  return true;
}

function getEngineFromState(state) {
  return getOwner(state.controller);
}

function lookupEngineController(engineInstance) {
  return engineInstance.lookup('controller:application');
}

function lookupEngineView(engineInstance, ownerView) {
  let engineView = engineInstance.lookup('view:application') || engineInstance.lookup('view:toplevel');

  if (engineView.ownerView !== ownerView) {
    engineView.ownerView = ownerView;
  }

  return engineView;
}

function lookupEngineTemplate(engineInstance) {
  let engineTemplate = engineInstance.lookup('template:application');

  if (engineTemplate && engineTemplate.raw) {
    engineTemplate = engineTemplate.raw;
  }

  return engineTemplate;
}

function buildEnvForEngine(engineInstance, parentEnv) {
  let engineView = lookupEngineView(engineInstance, parentEnv.view.ownerView);

  let engineTemplate = lookupEngineTemplate(engineInstance);

  let engineEnv = RenderEnv.build(engineView, engineTemplate.meta);

  return engineEnv;
}
