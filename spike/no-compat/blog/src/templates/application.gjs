import { hash } from '@ember/helper';
import LinkToExternal from 'ember-engines-runtime/components/link-to-external';
import UiGreeting from 'ui-kit/components/ui-greeting';
import SessionUser from '../components/session-user.gjs';
import GoHome from '../components/go-home.gjs';

<template>
  <section data-test-blog class="pad-md">
    <h2>Blog engine</h2>
    <p data-test-blog-user><SessionUser /></p>
    <p data-test-blog-greeting><UiGreeting /></p>
    <LinkToExternal @route="home" data-test-blog-home>Home</LinkToExternal>
    <LinkToExternal @route="item" @model="42" @query={{hash tab="details"}} data-test-blog-item>Item 42</LinkToExternal>
    <LinkToExternal @route="other" data-test-blog-other>Other mount</LinkToExternal>
    <GoHome />
    {{outlet}}
  </section>
</template>
