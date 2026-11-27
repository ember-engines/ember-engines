import { LinkTo } from '@ember/routing';

<template>
  <nav>
    <LinkTo @route="index" data-test-nav-home>Home</LinkTo>
    <LinkTo @route="blog" data-test-nav-blog>Blog</LinkTo>
    <LinkTo @route="blog.post" @model="7" data-test-nav-post>Post 7</LinkTo>
    <LinkTo @route="blog-two" data-test-nav-blog-two>Blog two</LinkTo>
    <LinkTo @route="shop" data-test-nav-shop>Shop</LinkTo>
  </nav>
  {{outlet}}
</template>
