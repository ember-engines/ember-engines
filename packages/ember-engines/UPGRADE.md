# ember-engines

## Breaking changes and how to resolve them

### 0.10.0

1. `<LinkToExternal />` component usage in Engine code;  
    add an addon component to each engine code using the `link-to-external` component
     ```js
     //<your engine>/addon/link-to-external
     export { default } from 'ember-engines/components/link-to-external';
     ```
    if the `link-to-external` component is not used then this is not required

2. `@ember/legacy-built-in-components` no longer required for ember engines; it can be removed from your app if it's the only reason it was added

3. add [ember-engines-router-service](https://github.com/villander/ember-engines-router-service) as a peer dependency to enable `@service router;` injection

4. in line with [RFC 674](https://rfcs.emberjs.com/id/0674-deprecate-transition-methods-of-controller-and-route/) dropping support for Route and Controller transtionTo methods in engines
    > migrate to using router service from ember-engines-router-service

5. drop support for query param only router service transitions until it's resolved upstream https://github.com/villander/ember-engines-router-service/issues/74
