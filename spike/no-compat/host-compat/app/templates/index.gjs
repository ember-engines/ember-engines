import UiGreeting from 'ui-kit/components/ui-greeting';

<template>
  <h1 data-test-home>Home</h1>
  <p data-test-host-greeting><UiGreeting /></p>
  {{mount "widget"}}
</template>
