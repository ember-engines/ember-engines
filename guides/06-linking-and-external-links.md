# Linking To An External Route

External routes are a way for your Engine to define locations that it would like to be able to link to. Applications are then responsible for telling you where those locations are.

In other words, the Engine defines _what_ it would like to go to and the application tells it _where_ that is.

```js
// super-blog/addon/engine.js
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



```js
// dummy/app/app.js
const App = Ember.Application.extend({
  // ...
  engines: {
    superBlog: {
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

Notice the camel-casing of `superBlog`.

## Using External Routes for Internal locations

In most cases, you should only need to use external routes to link to locations that you expect to be outside of your Engine. However, there are instances where you might need a link that could potentially be external or internal to your Engine.
