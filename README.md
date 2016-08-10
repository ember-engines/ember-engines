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
  contained engines. Shared dependencies are currently limited to services
  and route paths.

The following functionality will soon be supported:

* Lazy loading of engines.
* Route serializer modules that isolate serialization logic from the rest of
  the route definition.

Support for the following concepts is under consideration:

* Namespaced access to engine resources from applications.
* Sharing of dependencies other than services and route paths.
* Passing configuration attributes from an engine's parent.

## Important Note about Compatibility and Stability

This addon should be considered experimental and used with caution.

The [master branch of this addon](https://github.com/dgeb/ember-engines) is
being developed against the [master branch of
Ember](https://github.com/emberjs/ember.js). This branch includes experimental
lazy-loading features and should not be considered stable.

The [v0.3 branch of this addon](https://github.com/dgeb/ember-engines/tree/v0.3)
is being developed to be compatible with v2.8.x of Ember. This is the first
version of Ember in which the required hooks for engines are available
without a feature flag. Once v2.8.x of Ember stabilizes, this branch should
also be considered stable.

The [v0.2 branch of this addon](https://github.com/dgeb/ember-engines/tree/v0.2)
is being developed to be compatible with v2.6.x and v2.7.x of Ember. This branch
should be considered reasonably stable, although it does contain a number of
overrides to code in Ember core. Please proceed with caution.

## Introduction Video

[![Introduction to Ember Engines at Global Ember Meetup](https://i.vimeocdn.com/video/559400541_640x360.jpg)](https://vimeo.com/157688181)

## Installation

From your Ember CLI project's root directory, run the following:

```
ember install ember-engines
```

Install the appropriate version of Ember as noted above.

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
`in-repo-engine` generator:

```
ember g in-repo-engine <engine-name>
```

Don't forget to install `ember-engines` and the appropriate version of Ember in
your project, as described above.

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

Within your engine's `config` directory, create a new `environment.js` file:

```js
/*jshint node:true*/
'use strict';

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'ember-blog',
    environment: environment
  }

  return ENV;
};
```

Within your engine's `addon` directory, add a new `engine.js` file:

```js
import Engine from 'ember-engines/engine';
import Resolver from 'ember-engines/resolver'; // <=== IMPORTANT - custom resolver!!!
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const { modulePrefix } = config;

const Eng = Engine.extend({
  modulePrefix,
  Resolver
});

loadInitializers(Eng, modulePrefix);

export default Eng;
```

It's important that `modulePrefix` be set in `config/environment.js` so that
it can be referenced in `addon/engine.js`.

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
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const { modulePrefix } = config;

const Eng = Engine.extend({
  modulePrefix,
  Resolver,
  dependencies: {
    services: [
      'store'
    ]
  }
});

loadInitializers(Eng, modulePrefix);

export default Eng;
```

Currently, only services and route paths (see below) can be shared across the
parent/engine boundary.

### Linking To External Routes

Linking to routes outside of an Engine's isolated context is currently supported
by defining "external routes" as dependencies of your Engine.

You specify **what** external things your Engine wants to link to by providing
an array of names like so:

```js
// ember-blog/addon/engine.js
export default Engine.extend({
  // ...
  dependencies: {
    externalRoutes: [
      'home',
      'settings'
    ]
  }
});
```

The Engine's consumer is then responsible for defining **where** those things are
located via a route path:

```js
// dummy/app/app.js
const App = Ember.Application.extend({
  modulePrefix,
  podModulePrefix,
  Resolver,

  engines: {
    emberBlog: {
      dependencies: {
        externalRoutes: {
          home: 'home.index',
          settings: 'settings.blog.index'
        }
      }
    }
  }
});
```

You can then use those external routes either programmatically or within a
template like so:

```hbs
{{#link-to-external 'home'}}Go home{{/link-to-external}}
```

```js
// ember-blog/addon/some-route.js
this.transitionToExternal('settings');
```

For further documentation on this subject, view the [Engine Linking RFC](https://github.com/emberjs/rfcs/pull/122).

### Lazy-Loading Routing Considerations

When routing into an Engine that is lazily loaded there are some special considerations and subtle differences from how routing works in a normal Ember application.

#### Serialization of URLs

Since the links to your Engine are constructed before the Engine itself is loaded, you need to make sure the application has the necessary code to serialize data into the URLs. To that end, you need to replace any [`Route#serialize`](http://emberjs.com/api/classes/Ember.Route.html#method_serialize) functions with route serializers, as defined in [the Route Serializers RFC](https://github.com/emberjs/rfcs/blob/master/text/0120-route-serializers.md).

For example, if you had a `Post` route defined like so:

```js
export default Ember.Route.extend({
  serialize(model) {
    return { post_id: model.id };
  }
});
```

You would need to remove that function and inline it into your `routes.js` map, which is loaded pre-emptively with the application:

```js
function serializePost(model) {
  return { post_id: model.id };
}

export default buildRoutes(function() {
  this.route('post', { serialize: serializePost });
});
```

Note that route serializers are unique to Engines and won't work in normal applications. In a normal Ember application you should continue to use `Route#serialize`.

#### Loading / Error Substates

The loading and error substates work in a similar fashion to [substates in a normal Ember app](https://guides.emberjs.com/v2.6.0/routing/loading-and-error-substates/). The only difference is that lazily loaded Engines will enter a loading state while the assets for the Engine are loaded and can enter an error state when an asset fails to load.

### Accessing Engine Configuration Settings

As in an application, you can provide configuration settings for your
engine in `config/environment.js`. You can access these settings in a
couple different ways.

The simplest method is to import these settings:

```js
// addon/engine.js
import config from './config/environment';

console.log(config.modulePrefix);
```

Configuration settings are also registered with the key `config:environment` and
can be looked up given an engine instance. For example:

```js
// addon/instance-initializers/hello-instance.js
export function initialize(engineInstance) {
  let config = engineInstance.resolveRegistration('config:environment');
  console.log('modulePrefix', config.modulePrefix);
}

export default {
  name: 'hello-instance',
  initialize: initialize
};
```

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
import Resolver from 'ember-engines/resolver'; // <=== IMPORTANT - custom resolver!!!
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

Ember.MODEL_FACTORY_INJECTIONS = true;

const { modulePrefix, podModulePrefix } = config;

const App = Ember.Application.extend({
  modulePrefix,
  podModulePrefix,
  Resolver
});

loadInitializers(App, modulePrefix);

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

Ember.MODEL_FACTORY_INJECTIONS = true;

const { modulePrefix, podModulePrefix } = config;

const App = Ember.Application.extend({
  modulePrefix,
  podModulePrefix,
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

loadInitializers(App, modulePrefix);

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

Copyright 2015-2016 Dan Gebhardt and Robert Jackson. MIT License (see LICENSE.md for details).
