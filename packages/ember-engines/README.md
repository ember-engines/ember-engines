# ember-engines [![npm version](https://badge.fury.io/js/ember-engines.svg)](https://badge.fury.io/js/ember-engines) [![Build Status](https://github.com/ember-engines/ember-engines/actions/workflows/ci.yml/badge.svg)](https://github.com/ember-engines/ember-engines/actions/workflows/ci.yml)

This Ember addon implements the functionality described in the [Ember Engines
RFC](https://github.com/emberjs/rfcs/blob/master/text/0010-engines.md). Engines allow multiple logical
applications to be composed together into a single application from the user's
perspective.


## Compatibility

* Ember.js v3.28 or above
* Ember CLI v3.28 or above
* Node.js v16 or above


## Installation

```
ember install ember-engines
```


## Usage

Check the full documentation in the [Ember Engines
Guides](https://ember-engines.netlify.app).


## Using with Vite / Embroider

Under Embroider, ember-engines' router extensions are not used: Embroider
strips them and relies on Ember's built-in engine routing plus
[`@embroider/router`](https://github.com/embroider-build/embroider/tree/main/packages/router)
to load lazy engines. A few things the Vite codemod cannot infer are required:

* The host app's `app/router.js` must extend `@embroider/router`:

  ```js
  import EmberRouter from '@embroider/router'; // not '@ember/routing/router'
  ```

  Without it, mounting a lazy engine fails with *"You attempted to mount the
  engine '…' in your router map, but the engine can not be found."* (or, with
  assertions stripped, *"…but it is not registered with its parent."*).

* Each engine resolves its modules through `compatModules`:

  ```js
  import compatModules from '@embroider/virtual/compat-modules';

  export default class MyEngine extends Engine {
    Resolver = Resolver.withModules(compatModules);
  }

  loadInitializers(MyEngine, modulePrefix, compatModules);
  ```

* Engines are excluded from Vite's dependency pre-bundling in `vite.config.mjs`
  (`optimizeDeps.exclude: ['my-engine']`).

See [`packages/vite-app`](https://github.com/ember-engines/ember-engines/tree/master/packages/vite-app)
for a working example.

If an engine route throws *"Defining a custom serialize method on an Engine
route is not supported"* and the route does not define `serialize`, check for
more than one copy of `ember-source` in your build. The check compares
`serialize` by identity, so two copies of `Route` make it fail.


## Support

Having trouble? **Join #ember-engines** on the [Ember Community Discord
server](https://discord.gg/zT3asNS)


## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.


## License

Copyright 2015-2022 Dan Gebhardt, Michael Villander and Robert Jackson. MIT License (see
[LICENSE.md](LICENSE.md) for details).
