# Creating An Engine

Now that we have all the conceptual and theoretical talk out of the way, let's actually make an Engine!

As discussed above Engines are distributed as Addons, and since there is not yet an "engine" blueprint for Ember-CLI, we'll start by creating a vanilla Addon. The command for this is simply:

```bash
ember addon <engine-name>
```

So, if we name our Engine `super-blog`, we just do the following:

```bash
ember addon super-blog
```

At this point, you have a vanilla Addon which is not yet an Engine, so let's introduce the remaining pieces needed for it to function as a one.

First, since Engines are currently an experimental technology, we need to install a Beta version of Ember to make sure we have the features needed to enable them. We can do that like so:

```bash
cd super-blog/
rm -rf bower_components/ember
bower install --save ember#beta
```

If Bower complains about not finding a suitable version, choose the option that says `ember#beta` and persist it with `!`.

This will replace your `ember` version in `bower.json` with one pointing to the [Beta release channel of Ember](http://emberjs.com/builds/#/beta).

---

## Aside: Beta Versions

Before moving on, it is important to understand what using a Beta version of Ember entails. From the Ember builds page:

> Beta builds incorporate new features that are ready for evaluation in application code. We do not recommend using Beta builds in production.

Basically this means Beta versions are the next in line build to be released as a stable version. They are meant to be intalled to test new features and ensure backward compatible changes do not cause any regressions.

If any issues are found they sould be reported and if able fixed with a PR.

---

Now that we have our basic Addon created and proper support from Ember, we need to install the features for Engines not yet available in Ember proper. That support is currently enabled through the `ember-engines` addon, which we can install like so:

```bash
ember install ember-engines
```

Pretty simple. At this point, we have everything needed to actually create an Engine, but we don't have an Engine itself. We need to do one more thing to make that a reality: create the `engine.js` file:

```bash
touch addon/engine.js
```

Then add the following code to it:

```js
import Engine from 'ember-engines/engine';
import Resolver from 'ember-engines/resolver';
import loadInitializers from 'ember-load-initializers';

const modulePrefix = 'super-blog';
const Eng = Engine.extend({
  modulePrefix,
  Resolver
});

loadInitializers(Eng, modulePrefix);

export default Eng;
```

This code will hopefully look very familiar to anyone that has seen an Ember Application's `app.js` file before. Since Engine's are so closely related to Applications it makes sense that their initial files would look similar as well. Let's note 3 important points here:

1. **`modulePrefix`**:
2. **`Resolver`**:
3. **`loadInitializers`**:

As a final note, it is important that we put the `engine.js` file inside the `addon` directory. This is because we want it to be within the Addon's/Engine's namespace.



---

## Aside: App Vs Addon Namespace

Normal applications usually only need to worry about having a single namespace...

---

## Routes for Routable Engines

If you're building a Route-less Engine, then you can skip to the "Mounting An Engine" section. If, however, you're building a Routable Engine, you need to create one more file:

```bash
touch addon/routes.js
```

Note again, the usage of the `addon` directory.

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

Finally, we need to ensure `htmlbars` is listed as a dependency for compiling our templates.

```json
"dependencies": {
  "ember-cli-htmlbars": "^1.0.3"
}
```

---

## Aside: In-Repo-Engine Vs Standalone Engine

The differences between In-Repo-Engines and Standalone Engines are more-or-less the same as for Addons.
