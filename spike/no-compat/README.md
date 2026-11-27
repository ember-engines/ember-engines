# Spike: v2 lazy engines, with and without compat

What a v2 engine and its runtime need so that an app runs them without
`@embroider/compat`, and so that a compat app can run the same engines during
a migration. Tested on ember-source 7.3.1, @embroider/core 4.6.10,
@embroider/router 3.0.6 (patched with embroider-build/embroider#2848),
@embroider/vite 1.8, Vite 8.3, Babel 8.

A production build of `host` runs at <https://aklkv.github.io/ember-engines/>. It
lists each engine chunk as it loads.

| Package | What it is |
| --- | --- |
| `runtime/` | The runtime pieces of v1 ember-engines, reworked for v2:<br>• `./engine` is an `Engine` base class that applies the host/engine contract (see below) without patching Ember;<br>• `buildRoutes`;<br>• a Glimmer `<LinkToExternal>`;<br>• `./vite`, a host registration plugin;<br>• `./rollup`, with `expandGlob()` and `sass()`. |
| `blog/` | A v2 lazy engine built with tsdown + `@nullvoxpopuli/ember-rolldown`. It has Sass, query params and three external routes, is mounted twice, and has its own isolation app (`demo-app/`, `tests/`). |
| `comments/` | A v2 lazy engine mounted inside `blog`, built with rollup + `@embroider/addon-dev` and the runtime's `expandGlob()` and `sass()` plugins. |
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

- `host` and `host-compat` run the same 15 acceptance tests. The compat copy is
  generated from `host/tests`, so the two can't drift. The tests cover:
  - JS and CSS loading lazily;
  - a host `LinkTo` into an inner engine route before load;
  - host services through `dependencies.services`;
  - Sass;
  - an addon service looked up by name;
  - `<LinkToExternal>` with per-engine bindings, `@model(s)`, `@query`,
    `@replace`, `@current-when`, href and active state, a model that hasn't
    loaded, and `target="_blank"`;
  - router-service `transitionToExternal`;
  - sticky query params in a lazy engine;
  - multi-mount;
  - a nested engine.
- `blog`'s isolation app passes 3/3, from source against a fake host.
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
- It keeps v1's `_externalRoutes` and `_getExternalRoute`, because
  ember-engines-router-service reads them. Router-service's own `engine-ext`
  is still an `Engine.reopen`.

`<LinkToExternal>` covers `@route`, `@model`, `@models`, `@query`, `@replace`,
`@current-when` (external route names, as in v1), models that haven't loaded,
`target`, href and the `active` class. It doesn't implement
`@disabled`, `@activeClass`, the loading and transitioning classes, or
`@preventDefault`.

## What a no-compat app has to do today

1. **Register lazy engines and route maps.** `@embroider/core` emits
   `window._embroiderEngineBundles_` (and `_embroiderRouteBundles_` for
   `splitAtRoutes`) only inside `@embroider/virtual/compat-modules`, which a
   strict-resolver app doesn't import. `runtime/vite.mjs` generates the same
   from package metadata, with keys `./engines/<name>` and
   `./route-maps/<name>`. `pnpm demo:no-registration` shows the failure
   without it.
2. **Use an `@embroider/router` without the `active` gate.** 3.0.6, the latest
   release, only enables lazy loading when the macros global config has
   `@embroider/core: { active: true }`, which only compat sets.
   embroider-build/embroider#2848 removes the gate (merged, unreleased).
   The spike patches 3.0.6 with that change (`patches/`) and sets no flag; drop
   the patch once a release ships.
3. **Register nested routable engines on the host.** Ember's router builds
   every routable engine instance from the root owner. The plugin finds them
   through the engines' dependencies.
4. **Import router-service's `-private/engine-ext` explicitly**, because no
   addon initializers run.
5. **List addon services resolved by name** in the app's and each engine's
   `modules`. Nothing merges `app-js` any more. A missing entry fails silently
   (empty render).

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
