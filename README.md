# ember-engines [![Build Status](https://travis-ci.org/dgeb/ember-engines.png)](https://travis-ci.org/dgeb/ember-engines)

This Ember addon implements the functionality described in the [Ember Engines
RFC](https://github.com/emberjs/rfcs/pull/10). Engines allow multiple logical
applications to be composed together into a single application from the user's
perspective.

This addon must be installed in any ember-cli projects that function as either
consumers or providers of engines. The following functionality is supported:

* Routable engines which can be mounted at specific routes in a routing map, and
  which can contain routes of their own.
* Route-less engines, which can be rendered in a template using the `{{mount}}`
  keyword.
* Sharing of dependencies from parents (applications or other engines) to
  contained engines. Shared dependencies are currently limited to services.

The following functionality will soon be supported:

* Lazy loading of engines.
* Route serializer modules that isolate serialization logic from the rest of
  the route definition.

Support for the following concepts is under consideration:

* Namespaced access to engine resources from applications.
* Sharing of dependencies other than services.
* Passing configuration attributes from an engine's parent.

## Introduction Video

[![Introduction to Ember Engines at Global Ember Meetup](https://i.vimeocdn.com/video/559400541_640x360.jpg)](https://vimeo.com/157688181)

## Installation

From your Ember CLI project's root directory, run the following:

```
ember install ember-engines
```

You will also need to install Ember Canary:

```
rm -rf bower_components
bower install --save ember#canary
bower install
```

Bower may prompt you to select various "resolutions". Make sure to choose
`ember#canary` if prompted, and prefix the choice with ! to persist it to
`bower.json`.

## Providing Engines

### Creating Engines

Engines can be created as separate addon projects or in-repo addons.

Separate addon projects can be created with the `addon` command:

```
ember addon <engine-name>
```

_Note: As described in the RFC, ember-cli will hopefully support an `engine`
command to get started more easily with engine projects._

In order to create an engine within an existing application's project, run the
`in-repo-addon` generator:

```
ember g in-repo-addon <engine-name>
```

_Note: As described in the RFC, ember-cli will hopefully support an
`in-repo-engine` generator to get started more easily with in-repo engines._

Don't forget to install `ember-engines` and Ember Canary in your project, as
described above.

### Configuring your Engine

Within your engine's root directory, modify `index.js` so that your addon
is configured as an engine using the `EngineAddon` extension:

```js
/*jshint node:true*/
var EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'ember-blog'
});
```

Within your engine's `addon` directory, add a new `engine.js` file:

```js
import Engine from 'ember-engines/engine';
import Resolver from 'ember-engines/resolver';
import loadInitializers from 'ember-load-initializers';

const modulePrefix = 'ember-blog';
const Eng = Engine.extend({
  modulePrefix,
  Resolver
});

loadInitializers(Eng, modulePrefix);

export default Eng;

```

It's important to define a `modulePrefix` that will be used to resolve your
engine and its constituent modules.

### Routable Engines

Routable engines should declare their route map in a `routes.js` file.
For example:

```js
import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('new');

  this.route('post', { path: 'post/:id' }, function() {
    this.route('comments', function() {
      this.route('comment', { path: ':id' });
    });
  });
});
```

Routable engines interact with the parent application's router as if they are
an extension of the parent application. A routable engine's application route
will be mounted wherever specified by the parent's route map (its "mountpoint").

### Route-less Engines

Route-less engines should define an `engine.js` as described above. Neither
`router.js` nor `routes.js` should be defined. Route-less engines will be rendered as their application template
(`templates/application.hbs`).

### Declaring Dependencies

Your engine should declare any dependencies that it expects from its parent.
Dependencies must be declared in the engine definition.

For example, the following engine requires a `store` service from its parent:

```js
import Engine from 'ember-engines/engine';
import Resolver from 'ember-engines/resolver';

export default Engine.extend({
  modulePrefix: 'ember-blog',

  Resolver,

  dependencies: {
    services: [
      'store'
    ]
  }
});
```

Currently, only services can be shared across the parent/engine boundary.

## Consuming Engines

Engines that are published as separate addons should be installed like any
other addon:

```
ember install <engine-name>
```

As mentioned above, engines can also exist as in-repo addons, in which case
you just need to ensure that this addon (`ember-engines`) has been installed
in your main project.

### Customizing the Resolver

An Application or Engine that contains other engines must use the `Resolver`
provided in the `ember-engines/resolver` module. For example:

```js
import Ember from 'ember';
import Resolver from 'ember-engines/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
```

### Route-less Engines

Route-less engines can be rendered in a template using the `{{mount}}`
keyword.

#### Using `{{mount}}` in Templates

Route-less engines can be mounted in templates using the `{{mount}}` keyword.
For example, the following template renders the `ember-chat` engine:

```hbs
{{mount "ember-chat"}}
```

Currently, the engine name is the only argument that can be passed to
`{{mount}}`.

### Routable Engines

#### Mounting Engines in your Route Map

Routable engines should be mounted in your router's route map using the
`mount()` method. For example:

```js
import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('blogs', function() {
    // Mount the main blog at /blogs/ember-blog
    this.mount('ember-blog');

    // Mount the hr blog at /blogs/hr-blog
    this.mount('ember-blog', { as: 'hr-blog' });

    // Mount the admin blog at /blogs/special-admin-blog-here
    this.mount('ember-blog', { as: 'admin-blog', path: '/special-admin-blog-here' });
  });
});

export default Router;
```

The above example mounts three different instances of the `ember-blog` engine
within the `blogs` route.

The engine mounted with `this.mount('ember-blog')` will have a root path of
`/blogs/ember-blog` and its root route can be referenced as `ember-blog`.

The engine mounted with `this.mount('ember-blog', { as: 'hr-blog' })` will have
a root path of `/blogs/hr-blog` and its root route can be referenced as
`hr-blog`.

The engine mounted with `this.mount('ember-blog', { as: 'admin-blog', path:
'/special-admin-blog-here' })` will have a root path of
`/blogs/special-admin-blog-here` and its root route can be referenced as
`admin-blog`.

_Note: The above example is not very practical currently without a method to
configure individual instances of `ember-blog`._

### Providing Dependencies to Engines

Applications or engines that contain an engine must provide mappings that
fulfill the dependencies required by that engine.

For example, the following engine expects its parent to provide `store` and
`session` services:

```js
import Engine from 'ember-engines/engine';
import Resolver from 'ember-engines/resolver';

export default Engine.extend({
  modulePrefix: 'ember-blog',

  Resolver,

  dependencies: {
    services: [
      'store',
      'session'
    ]
  }
});
```

An application that contains this engine must explicitly fulfill these
dependencies. For example:

```js
import Ember from 'ember';
import Resolver from 'ember-engines/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,

  engines: {
    emberBlog: {
      dependencies: {
        services: [
          'store',
          {'session': 'user-session'}
        ]
      }
    }
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
```

Note that the app's `store` service is directly mapped to the engine's `store`
service, while the app's `user-session` service is mapped to the engine's
`session` service.

Also note that multiple engines can be configured per parent application/engine,
and that each engine name should be camelCased (`emberBlog` instead of
`ember-blog`).

## Contributing

### Installation

* `git clone` this repository
* `npm install`
* `bower install`

### Running

* `ember server`
* Visit your app at http://localhost:4200.

### Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).

## License

Copyright 2015 Dan Gebhardt and Robert Jackson. MIT License (see LICENSE.md for details).
