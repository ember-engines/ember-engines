import { array, hash } from '@ember/helper';
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
    <LinkToExternal @route="item" @models={{array 7}} data-test-blog-item-models>Item 7</LinkToExternal>
    <LinkToExternal @route="home" @current-when="blog" data-test-blog-home-current-when>Home (current-when blog)</LinkToExternal>
    <LinkToExternal @route="home" @replace={{true}} data-test-blog-home-replace>Home (replace)</LinkToExternal>
    <LinkToExternal @route="item" @model={{undefined}} data-test-blog-item-loading>Item (loading)</LinkToExternal>
    <LinkToExternal @route="home" target="_blank" data-test-blog-home-blank>Home (new tab)</LinkToExternal>
    <GoHome />
    {{outlet}}
  </section>
</template>
