# Sharing Components and More

Globally relevant constructs, such as Services and Routes, make sense to cross the boundaries of the Engines. Non-global constructs, such as Components, Helpers, Utilities, and more, do not make such sense.

```js
var EngineAddon = require('ember-engines/lib/engine-addon');
module.exports = EngineAddon.extend({
  name: 'super-blog'
});
```

The `EngineAddon` base class automatically imports any re-exports from your dependencies.

```json
{
  "dependencies": {
    "common-components": "1.0.0"
  }
}
```
