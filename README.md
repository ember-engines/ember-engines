# ember-engines

This README outlines the details of collaborating on this Ember addon.

## Rough Task List

A) Enable mounting of route-less engines:
  * `mount` method in routes (almost complete)
  * `{{mount}}` helper for templates (almost complete)

B) Enable mounting of routable engines:
  * Separate routing map from router
  * `mount` method in route map definition
  * Enable deep linking across engine boundaries

C) Establish dependency sharing between engines and parents
  * As per https://github.com/tomdale/rfcs/blob/master/active/0000-engines.md#engine--parent-dependencies

D) Make Ember CLI's resolver engine-aware:
  * See ember-cli-resolver project - https://github.com/ember-cli/ember-resolver

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
