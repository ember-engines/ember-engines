# Spike: v2 lazy engines, with and without compat

What a v2 engine and its runtime need so that a host runs them without
`@embroider/compat`, while a compat host can still run them during a migration.

| Package | What it is |
| --- | --- |
| `runtime/` | What ember-engines' v1 package provided at runtime: `buildRoutes`, `engine-instance-ext` (copied from ember-engines, plus a guard so it doesn't patch twice), and a Glimmer `<LinkToExternal>`. Also `./vite` (host registration plugin) and `./rollup` (`expandGlob()`, `sass()`). |
| `blog/` | v2 lazy engine built with tsdown + `@nullvoxpopuli/ember-rolldown`. Sass, query params, three external routes, mounted twice. Has its own isolation app (`demo-app/`, `tests/`). |
| `comments/` | v2 lazy engine mounted inside `blog`, built with rollup + `@embroider/addon-dev` and the runtime's `expandGlob()` and `sass()` plugins. |
| `ui-kit/` | v2 addon with a service that components look up by name, as HDS's `hds-intl` is. |
| `host/` | No-compat host: Vite, Ember 7.3's built-in strict resolver, no initializers, Babel 8. |
| `host-compat/` | Compat host (ember-cli + `@embroider/compat`) with v1 `ember-engines` installed, running the same engines. |

```sh
pnpm install
pnpm test                          # builds packages, runs host's suite
pnpm --filter host-compat test     # same suite on the compat host
pnpm --filter blog test            # blog in isolation, from source
pnpm --filter host start           # dev server; engines served from src
pnpm --filter host build && pnpm check:dist   # asserts the dist and chunk claims
```

CI (`.github/workflows/spike-no-compat.yml`) runs all of it on Node 24 and 26.

## Results (2026-11-26)

- `host` and `host-compat` run the same 12 acceptance tests and both pass all
  12. The tests cover:
  - laziness of the JS and CSS;
  - a host `LinkTo` into an inner engine route before load;
  - a host service passed through `dependencies.services`;
  - Sass;
  - a by-name addon service;
  - `<LinkToExternal>` with a per-engine binding, models, query params, href
    and active state;
  - router-service `transitionToExternal`;
  - sticky query params in a lazy engine;
  - multi-mount;
  - the nested engine.
- `blog`'s isolation app passes 3/3 from source against a fake host.
- Production: nothing loaded at boot (`index.html` plus its static imports)
  holds engine code or CSS, and each engine is its own lazy JS chunk and CSS
  file. `scripts/check-dist.mjs` asserts this. It also asserts that neither
  engine's dist contains `import.meta.glob` or a `.scss` import.
- Dev: the host resolves engines to `src` through a custom `workspace-source`
  export condition. Edits are served without rebuilding the engine, and Sass
  edits hot-swap.
- Both engine builds pass the same suites. tsdown + `@nullvoxpopuli/ember-rolldown`
  (from NullVoxPopuli/ember.nvp) needs no custom plugins: it expands
  `import.meta.glob`, compiles Sass and keeps the CSS import. rollup + addon-dev
  needs `expandGlob()` and `sass()`.

## What a no-compat host has to do

1. Register lazy engines in `window._embroiderEngineBundles_`, and route maps
   as `./route-maps/<name>`. With compat, `@embroider/core` emits these inside
   `@embroider/virtual/compat-modules`, which a strict-resolver app doesn't
   import. `runtime/vite.mjs` generates them from package metadata.
2. Set `@embroider/core: { active: true }` in the macros global config.
   `@embroider/router` only enables lazy loading behind that flag, and only
   compat sets it. Without it, mounts fail with "You attempted to mount the
   engine 'blog', but it is not registered with its parent."
3. Import `engine-instance-ext` and `ember-engines-router-service/-private/engine-ext`
   explicitly, because no addon initializers run.
4. Register nested routable engines on the host too. Ember's router builds
   every routable engine instance from the root owner.
5. List addon services that are resolved by name (here `ui-intl`) in both the
   host's and each engine's `modules`. Nothing merges `app-js` any more. If
   one is missing, it fails silently (empty render).

## What an engine package needs

- Keyword `ember-engine`, `ember-addon.lazy-engine: true`, and
  `implicit-modules: ["./routes.js"]` for compat hosts.
- Exports for `./engine`, `./engine.js`, `./routes` and `./routes.js`. Compat
  imports `routes.js`.
- `modules = import.meta.glob(...)` in `engine.js`, expanded at build time.
  RFC 939 doesn't allow the glob in published packages.
- Styles imported from `engine.js` (Sass is fine) and compiled at build time.
- A `workspace-source` condition is optional and only for monorepo dev. Don't
  use the standard `development` condition, which would make every consumer's
  dev server compile the engine's source.
