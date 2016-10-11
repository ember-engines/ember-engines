# Mounting An Engine

Now that we have our Engine created, let's actually mount it so that we can see it in action.

## Creating Engine Templates

In order to actually tell that our Engine renders properly, we need to add a template.

```bash
mkdir addon/templates
touch addon/templates/application.hbs
```

Let's add something super simple:

```hbs
<h3>Hello World!</h3>
```

## Routable Engines

Mounting a Routable Engine is done through the consumer's `Router`.

```js
Router.map(function() {
  this.mount('super-blog');
});
```

Within a Routable Engine the scoping of links and route's is relative to the Engine's "mount point". That is, the route at which it is mounted.

In other words, if you're trying to go to route `super-blog.posts.index`, you might do the following from the host application:

```hbs
{{#link-to "super-blog.posts.index"}}Comments{{/link-to}}
```

You would do the following from within the Engine itself:

```hbs
{{#link-to "posts.index"}}Comments{{/link-to}}
```

However, what if you wanted to go to `super-blog` (or the root of the Engine) from within the Engine? It would look something like this:

```hbs
{{#link-to "index"}}Blog Home{{/link-to}}
```

## Route-less Engines

`tests/dummy/app/templates/application.hbs`

```hbs
{{mount "super-blog"}}
```
