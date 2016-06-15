import Ember from "ember";
import emberRequire from '../ext-require';

// const internal = emberRequire('htmlbars-runtime').internal;
const read = emberRequire('ember-metal/streams/utils', 'read');
const registerKeyword = emberRequire('ember-htmlbars/keywords', 'registerKeyword');
// const legacyViewKeyword = emberRequire('ember-htmlbars/keywords/view');
const ViewNodeManager = emberRequire('ember-htmlbars/node-managers/view-node-manager');
const RenderEnv = emberRequire('ember-htmlbars/system/render-env');
const EmptyObject = emberRequire('ember-metal/empty_object');

const {
  assert
} = Ember;

// var isStable;
// try {
//   isStable = emberRequire('ember-htmlbars/keywords/real_outlet').default.isStable;
// } catch (err) {
//   isStable = emberRequire('ember-htmlbars/keywords/outlet').default.isStable;
// }
//
// // Given an Ember Component, return the containing element
// export function containingElement(view) {
//   return view._renderNode.contextualElement;
// }
//
// // This is Ember's {{#if}} predicate semantics (where empty lists
// // count as false, etc).
// export var shouldDisplay = emberRequire('ember-views/streams/should_display').default;
//
// // Finds the route name from a route state so we can apply our
// // matching rules to it.
// export function routeName(routeIdentity) {
//   var o, r;
//   if (routeIdentity && (o = routeIdentity.outletState) && (r = o.render)) {
//     return [ r.name ];
//   }
// }
//
// // Finds the route's model from a route state so we can apply our
// // matching rules to it.
// export function routeModel(routeIdentity) {
//   var o;
//   if (routeIdentity && (o = routeIdentity.outletState)) {
//     return [ o._lf_model ];
//   }
// }
//
// function withLockedModel(outletState) {
//   var r, c;
//   if (outletState && (r = outletState.render) && (c = r.controller) && !outletState._lf_model) {
//     outletState = Ember.copy(outletState);
//     outletState._lf_model = c.get('model');
//   }
//   return outletState;
// }

registerKeyword('mount', {
  willRender(renderNode, env) {
    if (env.view.ownerView._outlets) {
      // We make sure we will get dirtied when outlet state changes.
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

    let engineInstance = buildEngineFromEnv(name, env);

    let state = {
      parentView: env.view,
      manager: prevState.manager,
      controller: engineInstance.lookup('controller:application'),
      childOutletState: childOutletState(name, env),
      _engineInstance: engineInstance
    };

    return state;
  },

  childEnv(state, env) {
    // let childEnv = env.childWithOutletState(state.childOutletState);
    let childEnv = buildEnvForEngine(getEngineFromState(state), env);
    return childEnv;
  },

  isStable(lastState, nextState) {
    return isStable(lastState.childOutletState, nextState.childOutletState);
  },

  isEmpty(/* state */) {
    return false;
  },

  render(node, env, scope, params, hash, template, inverse, visitor) {
    var state = node.getState();
    // var name = params[0];
    // var context = params[1];

    // var owner = env.owner;

    // The render keyword presumes it can work without a router. This is really
    // only to satisfy the test:
    //
    //     {{view}} should not override class bindings defined on a child view"
    //

    // let engineName = params[0];

    let engineInstance = getEngineFromState(state); // owner.buildChildEngineInstance(engineName);
    if (!engineInstance._booted) {
      engineInstance.boot();
    }

    let engineController = engineInstance.lookup('controller:application');

    // let engineView = engineInstance.lookup('view:application');

    let engineTemplate = engineInstance.lookup('template:application');
    //TODO - assert engineTemplate

    // let router = owner.lookup('router:main');

    // var templateName = 'template:' + name;
    // assert(
    //   'You used `{{render \'' + name + '\'}}`, but \'' + name + '\' can not be ' +
    //   'found as either a template or a view.',
    //   owner.hasRegistration('view:' + name) || owner.hasRegistration(templateName) || !!template
    // );
    //
    var view = engineInstance.lookup('view:application');
    if (!view) {
      view = engineInstance.lookup('view:toplevel');
    }
    // var viewHasTemplateSpecified = view && !!get(view, 'template');
    // if (!template && !viewHasTemplateSpecified) {
    //   template = owner.lookup(templateName);
    // }

    if (view.ownerView !== env.view.ownerView) {
      view.ownerView = env.view.ownerView;
    }

    // // provide controller override
    // var controllerName;
    // var controllerFullName;
    //
    // if (hash.controller) {
    //   controllerName = hash.controller;
    //   controllerFullName = 'controller:' + controllerName;
    //   delete hash.controller;
    //
    //   assert(
    //     'The controller name you supplied \'' + controllerName + '\' ' +
    //     'did not resolve to a controller.',
    //     owner.hasRegistration(controllerFullName)
    //   );
    // } else {
    //   controllerName = name;
    //   controllerFullName = 'controller:' + controllerName;
    // }
    //
    // var parentController = read(scope.getLocal('controller'));
    // var controller;
    //
    // // choose name
    // if (params.length > 1) {
    //   var factory = owner._lookupFactory(controllerFullName) ||
    //                 generateControllerFactory(owner, controllerName);
    //
    //   controller = factory.create({
    //     model: read(context),
    //     parentController: parentController,
    //     target: parentController
    //   });
    //
    //   node.addDestruction(controller);
    // } else {
    //   controller = owner.lookup(controllerFullName) ||
    //                generateController(owner, controllerName);
    //
    //   controller.setProperties({
    //     target: parentController,
    //     parentController: parentController
    //   });
    // }
    //
    // if (engineView) {
    //   engineView.set('controller', engineController);
    // }

    // NOTE: setting state.controller now handled in `setupState`
    // state.controller = engineController;

    // hash.viewName = camelize(name);

    if (engineTemplate && engineTemplate.raw) {
      engineTemplate = engineTemplate.raw;
    }

    var options = {
      layout: null,
      self: engineController
    };

    // if (engineView) {
    //   options.component = engineView;
    // }

    let engineEnv = buildEnvForEngine(engineInstance, env);

    var nodeManager = ViewNodeManager.create(node, engineEnv, hash, options, state.parentView, null, null, engineTemplate);
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
  var topLevel = env.view.ownerView;
  if (!topLevel || !topLevel.outletState) { return; }

  var outletState = topLevel.outletState;
  if (!outletState.main) { return; }

  var selectedOutletState = outletState.main.outlets['__ember_orphans__'];
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
  return state._engineInstance;
}

function buildEngineFromEnv(name, env) {
  let engineInstance = env.owner.buildChildEngineInstance(name);
  engineInstance.boot();
  return engineInstance;
}

function buildEnvForEngine(engineInstance, parentEnv) {
  let view = engineInstance.lookup('view:application') || engineInstance.lookup('view:toplevel');
  let engineTemplate = engineInstance.lookup('template:application');

  if (view.ownerView !== parentEnv.view.ownerView) {
    view.ownerView = parentEnv.view.ownerView;
  }

  let engineEnv = RenderEnv.build(view, engineTemplate.meta);

  return engineEnv;

}
