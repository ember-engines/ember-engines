# ember-engines [![npm version](https://badge.fury.io/js/ember-engines.svg)](https://badge.fury.io/js/ember-engines) [![Build Status](https://travis-ci.org/ember-engines/ember-engines.svg?branch=master)](https://travis-ci.org/ember-engines/ember-engines)

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
* Lazy loading of engines.

The following functionality will soon be supported:

* Route serializer modules that isolate serialization logic from the rest of
  the route definition.

Support for the following concepts is under consideration:

* Namespaced access to engine resources from applications.
* Sharing of dependencies other than services and route paths.
* Passing configuration attributes from an engine's parent.

## Important Note about Compatibility and Stability

This addon should be considered experimental. But engines are production ready and many of the APIs are fully stable.

The [master branch of this addon](https://github.com/ember-engines/ember-engines)
is being developed against the master branch of Ember and Ember-CLI, and should
be considered unstable. If you're planning to deploy to production, please use
one of the stable releases.

[v0.5 of this addon](https://github.com/ember-engines/ember-engines/tree/v0.5.0)
is compatible with v2.12.x of both Ember and Ember-CLI.

[v0.4 of this addon](https://github.com/ember-engines/ember-engines/tree/v0.4.0)
is compatible with v2.10.x of both Ember and Ember-CLI.

[v0.3 of this addon](https://github.com/ember-engines/ember-engines/tree/v0.3)
is compatible with v2.8.x of Ember. This is the first version of Ember in which
the required hooks for engines are available without a feature flag.

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

### Lazy Loading Engines

You must also declare in your Engine's `index.js` file whether or not the engine should be lazy loaded. Until lazy loading is supported, this should be set to `false`:
```js
const EngineAddon = require('ember-engines/lib/engine-addon');
module.exports = EngineAddon.extend({
  name: 'ember-blog',
  lazyLoading: {
    enabled: false
  }
});
```

### Routable Engines

Routable engines should declare their route map in a `routes.js` file within your engine's `addon` directory.
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
import Resolver from 'ember-resolver';
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
import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
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
import Route from "@ember/routing/route";

export default Route.extend({
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

## Built Engine Output

### Eager Engines

Eager engines are built approximately the same as existing addons. Differences
are limited to consolidating the namespace of `app` code inside of an engine
into the engine's namespace instead of the host application.

Beyond that it adds in a configuration module for the engine, and nothing else.
It is a remarkably straightforward process.

### Lazy Engines

Lazy engines are built in the same way as eager engines, but their assets are
not combined back into the host application's `vendor.js` file. This means that
they are run through a separate and unique build process from what a default
addon will go through, though it reaches out to the upstream implementation in
Ember CLI where possible.

A lazy engine's output (`lazy-engine`) looks like this:
```
dist
├── assets
│   ├── host-application.css
│   ├── host-application.js
│   ├── vendor.css
│   └── vendor.js
├── crossdomain.xml
├── engines-dist
│   └── lazy-engine
│       ├── assets
│       │   ├── engine-vendor.css
│       │   ├── engine-vendor.js
│       │   ├── engine.css
│       │   └── engine.js
│       └── public-asset.jpg
├── index.html
└── robots.txt
```

#### `/addon/routes.js`

The `routes.js` file and anything it `import`s must be present at boot time of
the host application. It will be bundled into the host application's `vendor.js`
file. This location should be considered `undefined` behavior and should not be
relied upon as it may change in the future.

Its module name inside of the host application will be `lazy-engine/routes`. Any
`import`s will also be in the `lazy-engine` module path.

#### `/app`

Assets in this folder don't make sense and will be ignored as they break the
isolation guarantees of engines.

#### `/addon`

JavaScript assets in this folder will be processed as per normal addon behavior
except that they will end up inside of the `engine.js` file. Their module
definition will be rooted to the engine name.

For example, `/addon/routes/application.js` will result in a JavaScript module
named `lazy-engine/routes/application` inside of the
`/dist/engines-dist/lazy-engine/engine.js` file.

#### `/addon/templates`

Templates will be compiled by your engine but they must include
`ember-cli-htmlbars` inside of `dependencies` in the engine's `package.json`.

As an example, `/addon/templates/application.hbs` will result in a JavaScript
module named `lazy-engine/templates/application` inside of the
`/dist/engines-dist/lazy-engine/engine.js` file.

#### `/addon/styles/**/*.css`

CSS files will be built similarly to how they are processed inside of typical
adddons. Typical addon behavior is as follows:

1. All nested addons are processed. Each of them may return a `style` tree. By
default these style trees only contain the contents of `addon/styles/addon.css`.
The contents of the `addon/styles/addon.css` file is moved inside of the
Broccoli tree to `${addon-name}.css`. This can be modified if the addon
specifies a custom `treeForStyle` hook.
2. All top-level addons (those directly depended upon by the host) have all of
`addon/styles/**/*.css` included into the host's `vendor.css` file. For example
`addon/styles/foo.css` will appear in the output Broccoli tree at `foo.css`.
3. If you name a CSS file in one of the top-level addons the same as an addon
name (e.g. addon name is `alpha`), any top-level addon which has a CSS file
of the same name as that addon (`alpha.css`) and is provided by an addon
lexicographically after it (`zeta`) will clobber the contents of
`alpha/addon/styles/addon.css` (from anywhere in the dependency graph) with
`zeta/addon/styles/alpha.css`. (This is also a possible consequence of DAG
topsorting.)

Lazy engines will use a variation of this approach:

1. The engine itself will be treated as if it is a top-level dependency. This
means that `addon/styles/**/*.css` will end up inside of `engine.css`.
2. Child addons of a lazy engine will be treated as if they are top-level
addons. This means that they will have their `treeForStyle` hook executed and
the result of that hook will be merged into `engine-vendor.css` in
DAG/lexicographic order.
3. Nested lazy engine boundaries will not be crossed when calculating the child
`treeForStyle` hook.

#### `/public`

Assets appearing in the public folder will appear at the root of the engine
output with no transformation. For example `/public/public-asset.jpg` appears at
the root level of the `/dist/engines-dist/lazy-engine/` output folder. Assets in
this folder have no default behavior and you are responsible for any custom
behavior.

#### Asset Manifest

Further, the engine must enumerate its primary assets (JS and CSS) in order to
be loaded by the asset loading service. That will be generated at
`/dist/asset-manifest.json` at build time. It will also by default be inserted
into a meta tag config inside of the host application's `index.html`.

### Nested Eager Engines

Nested eager engines will be built into their host engine or application.
Modules will be deduplicated within the engine boundary and with the host
application.

### Nested Lazy Engines

Nested lazy engines will be promoted to `/dist/engines-dist/` folder in the
build output. Module deduplication will only be done with the host application.

## Consuming Engines

Engines that are published as separate addons should be installed like any
other addon:

```
ember install <engine-name>
```

As mentioned above, engines can also exist as in-repo addons, in which case
you just need to ensure that this addon (`ember-engines`) has been installed
in your main project.

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
import Route from "@ember/routing/route"
import config from './config/environment';

const Router = Router.extend({
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
import Resolver from 'ember-resolver';

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
import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const { modulePrefix, podModulePrefix } = config;

const App = Application.extend({
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

### Unit/Integration testing for in repo-engines

To test components declared inside an in-repo engine, you need to set a custom resolver with the engine's prefix.

Assuming you have an in-repo engine called `appointments-manager` and it has a component `date-picker`. The
following would be the setup to test such component from the host app:

```js
// host-app/tests/integration/components/date-picker-test.js

import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import engineResolverFor from 'ember-engines/test-support/engine-resolver-for';

const resolver = engineResolverFor('appointments-manager');

moduleForComponent('date-picker', 'Integration | Component | Date picker', {
  integration: true,
  resolver
});

test('renders text', function(assert) {
  this.render(hbs`{{date-picker}}`);

  assert.equal(this.$().text().trim(), 'una fecha');
});
```

**Note: you could create a helper and then use it like `Resolver from ../helpers/appointments-manager/resolver`**

### Testing for standalone engines

If you have a lazy engine, you'll need to edit your `tests/test-helper.js` like this:

```js
import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';
import preloadAssets from 'ember-asset-loader/test-support/preload-assets';
import manifest from 'dummy/config/asset-manifest';
import { start } from 'ember-cli-qunit';

setResolver(resolver);
preloadAssets(manifest).then(start); // This ensures all engine resources are loaded before the tests
```

This should be enough to make integration & acceptance tests work.
For unit tests, you'll need to use a custom resolver, as described in [Unit/Integration testing for standalone engines](#unitintegration-testing-for-in-repo-engines).

## Demo Projects

* [ember-engines-demo](https://github.com/dgeb/ember-engines-demo) - an example of a parent application (consumer).
  * ember-chat-engine - an example of a route-less engine that is an in-repo addon.
* [ember-blog-engine](https://github.com/dgeb/ember-blog-engine) - an example of a routable engine that is a separate addon project.

## Contributing

### Installation

* `git clone` this repository
* `npm install`

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
