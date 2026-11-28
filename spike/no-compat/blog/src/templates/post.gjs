import { LinkTo } from '@ember/routing';

<template>
  <h3 data-test-post-title>{{@model.title}}</h3>
  <LinkTo @route="index" data-test-back>All posts</LinkTo>
</template>
