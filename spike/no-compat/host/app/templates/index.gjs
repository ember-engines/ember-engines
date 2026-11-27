import UiGreeting from 'ui-kit/components/ui-greeting';

<template>
  <h1 data-test-home>Home</h1>
  <p>
    An Ember app without @embroider/compat (Vite, Ember's built-in strict
    resolver) hosting two lazy v2 engines. Open <em>Blog</em>: its JS and CSS
    load on first visit. Blog mounts <em>Comments</em>, which loads on its own,
    and Blog is mounted a second time at <em>Blog two</em>. Source:
    <a href="https://github.com/aklkv/ember-engines/tree/spike/no-compat-host/spike/no-compat">spike/no-compat</a>.
  </p>
  <p data-test-host-greeting><UiGreeting /></p>
</template>
