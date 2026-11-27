# Spike: v2 engines, with and without compat

What a v2 engine and its runtime need so that an app runs them without
`@embroider/compat`, and so that a compat app can run the same engines during
a migration. Tested on ember-source 7.3.1, @embroider/core 4.6.10,
@embroider/router 4.0,
@embroider/vite 1.8, Vite 8.3, Babel 8.

A production build of `host` runs at <https://aklkv.github.io/ember-engines/>. It
lists each engine chunk as it loads.

| Package | What it is |
| --- | --- |
| `runtime/` | The runtime pieces of v1 ember-engines, reworked for v2:<br>• `./engine` is an `Engine` base class that applies the host/engine contract (see below) without patching Ember;<br>• `buildRoutes`;<br>• a Glimmer `<LinkToExternal>`;<br>• `./services/router`, the engine's router service;<br>• `./vite`, with the host plugins `engines()` (registration) and `publicAssets()`;<br>• `./test-support`, with `setupEngine` and `loadEngine`;<br>• `./rollup`, with `expandGlob()` and `sass()`. |
| `blog/` | A v2 lazy engine built with tsdown + `@nullvoxpopuli/ember-rolldown`. It has Sass, query params and three external routes, is mounted twice, and has its own isolation app (`demo-app/`, `tests/`). |
| `comments/` | A v2 lazy engine mounted inside `blog`, built with rollup + `@embroider/addon-dev` and the runtime's `expandGlob()` and `sass()` plugins. |
| `shop/` | A v2 eager engine (routable, no `lazy-engine`), bundled with the host. |
| `widget/` | A v2 routeless engine, rendered with `{{mount "widget"}}`. |
| `ui-kit/` | A v2 addon whose component looks up its service by name, as many design-system components do. |
| `host/` | The no-compat app: Vite, Ember's built-in strict resolver, no initializers. |
| `host-compat/` | A compat app (ember-cli + `@embroider/compat`) running the same engines, with v1 `ember-engines` also installed, the way an app looks mid-migration. |

```sh
pnpm install
pnpm build:addons
pnpm --filter host test           # the acceptance suite, no compat
pnpm --filter host-compat test    # the same suite, compat + v1 ember-engines
pnpm --filter blog test           # blog in isolation, from source
pnpm --filter host build && pnpm check:dist
pnpm test:node                    # expandGlob
pnpm demo:no-registration         # shows mounts failing without host registration
pnpm --filter host start          # dev server; workspace engines served from src
```

CI (`.github/workflows/spike-no-compat.yml`) runs all of these except the dev
server on Node 24 and 26.

## What it shows

- `host` and `host-compat` run the same 19 acceptance tests. The compat copy is
  generated from `host/tests`, so the two can't drift. The tests cover:
  - JS and CSS loading lazily;
  - a host `LinkTo` into an inner engine route before load;
  - host services through `dependencies.services`;
  - Sass;
  - an addon service looked up by name;
  - `<LinkToExternal>` with per-engine bindings, `@model(s)`, `@query`,
    `@replace`, `@current-when`, href and active state, a model that hasn't
    loaded, and `target="_blank"`, plus one rendered by the host itself;
  - an engine's `public-assets` in the build (`runtime/node-tests` covers the
    dev server, with and without a base path);
  - the engine's router service and `transitionToExternal`;
  - sticky query params in a lazy engine;
  - multi-mount;
  - a nested engine;
  - an eager routable engine, loaded at boot;
  - a routeless engine rendered with `{{mount}}`, with host services.
- `blog`'s isolation app passes 14/14, from source against a fake host. Four
  cover `setupEngine` and seven the engine's router service.
- `check:dist` asserts the build output:
  - no published engine dist contains `import.meta.glob` (RFC 939) or a
    `.scss` import;
  - nothing loaded at boot (`index.html` and its static imports) holds engine
    code or CSS;
  - each engine is its own lazy JS chunk and CSS file.
- Both engine builds pass the same suites. tsdown + ember-rolldown needs no
  custom plugins. rollup + addon-dev needs `expandGlob()` and `sass()`.
- Dev (manual, not in CI): `host` resolves workspace engines to `src` through
  a custom `workspace-source` export condition, enabled only for `vite serve`.
  Engine edits are served without a rebuild, and Sass edits hot-swap.

## The engine base class

`ember-engines-runtime/engine` replaces v1's `EngineInstance.reopen` patch:

- `Engine#buildInstance` is public, so the base class returns an
  `EngineInstance` subclass.
- That subclass wires the contract in the public `boot()`, after Ember sets the
  parent and before anything in the engine is looked up.
- Nothing global is patched, so it works with or without v1 ember-engines in
  the same app.
- Engines set `engineName`, because Ember doesn't pass the name to
  `buildInstance`.
- One private call remains: `ensureInitializers()`, which the stock
  `buildInstance` makes too.
- It registers the engine's `service:router` when the instance boots, unless
  the engine ships its own or takes the host's through
  `dependencies.services`. That's ember-engines-router-service's API folded
  in (`transitionTo`, `*External` methods, `currentRouteName`,
  `externalRouter`, route events), at about 140 lines instead of 256: a native
  service that delegates to the host's router, with no `Engine.reopen`, no
  mixins and no private contract between two packages. Route event listeners
  live on the host's router. `rootApplication` and `getExternalRouteName()`
  are gone.

`<LinkToExternal>` covers `@route`, `@model`, `@models`, `@query`, `@replace`,
`@current-when` (external route names, as in v1), models that haven't loaded,
`target`, href and the `active` class. Without a mount point it takes `@route`
as a host route, like v1: in the host, so a design-system link shared by host
and engines renders in both, and in a routeless engine, whose `externalRoutes`
it therefore ignores, also like v1. Before the first transition, a route that
needs params gives no URL, as Ember's routing service does for `<LinkTo>`. It doesn't implement
`@disabled`, `@activeClass`, the loading and transitioning classes, or
`@preventDefault`.

## Testing an engine

`ember-engines-runtime/test-support` keeps v1's API. `setupEngine(hooks,
'name')` boots the engine before each test and sets `this.engine`: look its
routes, controllers and services up there, and render its components with
`render(template, { owner: this.engine })`. `loadEngine('name')` does the same
for one engine, loading a lazy engine's bundle the way `@embroider/router` does.

What changes from v1: no `service:asset-loader` and no AMD `require`. A lazy
engine's bundle comes from `_embroiderEngineBundles_`, and its modules go to
the resolver's `addModules`. That happens before any registry lookup for the
engine, because the registry remembers a miss.

## What a no-compat app has to do today

1. **Register lazy engines and route maps.** `@embroider/core` emits
   `window._embroiderEngineBundles_` (and `_embroiderRouteBundles_` for
   `splitAtRoutes`) only inside `@embroider/virtual/compat-modules`, which a
   strict-resolver app doesn't import. `runtime/vite.mjs` generates the same
   from package metadata, with keys `./engines/<name>` and
   `./route-maps/<name>`. `pnpm demo:no-registration` shows the failure
   without it.
2. **Use `@embroider/router` 4.0 or later.** 3.x only enables lazy loading
   when the macros global config has `@embroider/core: { active: true }`, which
   only compat sets. embroider-build/embroider#2848 removed that gate, and 4.0.0
   is the first release without it.
3. **Register nested routable engines on the host.** Ember's router builds
   every routable engine instance from the root owner. The plugin finds them
   through the engines' dependencies.
4. **List addon services resolved by name** in the app's and each engine's
   `modules`. Nothing merges `app-js` any more. A missing entry fails silently
   (empty render).
5. **Serve engines' `public-assets`.** Compat serves and copies them through
   `@embroider/vite`'s `assets()`, which reads compat's resolver config.
   Without it, an engine's images get the app's `index.html`.
   `publicAssets()` in `runtime/vite.mjs` serves and emits them from package
   metadata. In dev it answers the requests itself rather than through Vite's
   file serving, which would transform scripts and apply `server.fs.allow`.
   This affects any v2 addon with `public-assets`, not only engines.

## Engine types

| Type | `package.json` | Loads |
| --- | --- | --- |
| Lazy, routable | `lazy-engine: true`, exports `./routes` and `./engine`, `implicit-modules: ["./routes.js"]` | Its own JS and CSS, when one of its routes is entered (`@embroider/router`) |
| Eager, routable | Exports `./routes` and `./engine`, `implicit-modules: ["./routes.js"]`, no `lazy-engine` | With the host, at boot |
| Routeless | Exports only `./engine`, no `lazy-engine` | With the host, at boot; rendered with `{{mount "name"}}` |

- A routeless engine can't be lazy: nothing routes into it, so nothing would
  load it. `runtime/vite.mjs` rejects a lazy engine without `./routes`.
- In Ember 7.3, `{{mount}}` calls the engine's `template:application` as a
  template factory, so a routeless engine's application template has to be one
  (`precompileTemplate()`, see `widget/src/templates/application.js`). A
  `.gjs` `<template>` works for route templates, which may be components,
  but not here.
- Laziness is static. v1 apps often turned lazy loading off in development
  (`lazyLoading.enabled = EMBER_ENV !== 'development'` in the engine's
  `index.js`). `lazy-engine` is package metadata, so an engine is lazy, or
  eager, in every environment, and development and tests behave like
  production.

## What an engine package needs

- Keyword `ember-engine`, `ember-addon.lazy-engine: true`, and
  `implicit-modules: ["./routes.js"]` for compat apps.
- Exports for `./engine`, `./engine.js`, `./routes` and `./routes.js` (compat
  imports `routes.js`).
- `engine.js` extends `ember-engines-runtime/engine`, sets `engineName`, and
  declares `modules = import.meta.glob(...)`, expanded at build time.
- Styles imported from `engine.js` (Sass is fine), compiled at build time.
- Optionally, a `workspace-source` condition for monorepo dev. Don't use the
  standard `development` condition: every consumer's dev server would then
  compile the engine's source.
- Declarations only if the engine is published. An app's private engines
  (workspace packages nobody installs) can skip them; in one app that was
  about three quarters of each engine's build time. Hosts and engines that
  import another engine can type-check its source through the same custom
  condition (`"customConditions": ["workspace-source"]` in `tsconfig.json`).
