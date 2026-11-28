import LinkToExternal from 'ember-engines-runtime/components/link-to-external';
import SessionUser from '../components/session-user.gjs';

<template>
  <section data-test-comments>
    <h3>Comments engine</h3>
    <p data-test-comments-user><SessionUser /></p>
    <LinkToExternal @route="home" data-test-comments-home>Home</LinkToExternal>
  </section>
</template>
