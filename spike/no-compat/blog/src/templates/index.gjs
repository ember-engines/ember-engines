import { hash } from '@ember/helper';
import { LinkTo } from '@ember/routing';

<template>
  <p data-test-sort>{{@controller.sort}}</p>
  <LinkTo @route="index" @query={{hash sort="old"}} data-test-sort-old>Oldest first</LinkTo>
  <ul data-test-posts>
    <li><LinkTo @route="post" @model="1" data-test-post-link>Post 1</LinkTo></li>
    <li><LinkTo @route="comments" data-test-comments-link>Comments</LinkTo></li>
  </ul>
</template>
