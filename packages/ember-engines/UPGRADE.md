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