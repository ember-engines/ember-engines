# ember-engines [![npm version](https://badge.fury.io/js/ember-engines.svg)](https://badge.fury.io/js/ember-engines) [![Build Status](https://travis-ci.org/ember-engines/ember-engines.svg?branch=master)](https://travis-ci.org/ember-engines/ember-engines)

This Ember addon implements the functionality described in the [Ember Engines
RFC](https://github.com/emberjs/rfcs/blob/master/text/0010-engines.md). Engines allow multiple logical
applications to be composed together into a single application from the user's
perspective.

# Table of Contents

**Basic Information**

* [What are Engines?](http://ember-engines.com/guide/what-are-engines)
* [How does it work?](http://ember-engines.com/guide/core-concepts)

**Usage**

* [Installation](#installation)

**Core Feature Guides**

* [Create an Engine](http://ember-engines.com/guide/creating-an-engine)
* [Mouting An Engine](http://ember-engines.com/guide/mounting-engines)
  * [Linking And External Links](http://ember-engines.com/guide/linking-and-external-links)
  * [Sharing Services](http://ember-engines.com/guide/linking-and-external-links)
  * [Linking And External Links](http://ember-engines.com/guide/linking-and-external-links)
  * [Sharing Components and More](http://ember-engines.com/guide/linking-and-external-links)
  * [Lazy Loading](http://ember-engines.com/guide/lazy-loading)
* [Engines & Addons](http://ember-engines.com/guide/addons)
* [Deploy An Engine](http://ember-engines.com/guide/deploying-engines)
* [Testing](http://ember-engines.com/guide/testing)

**Other Resources**

* [Engine API Documentation](https://api.emberjs.com/ember/release/classes/Engine)
* [Engines 1.0 Roadmap](https://discuss.emberjs.com/t/engines-1-0-roadmap/14914)


## Important Note about Compatibility and Stability

This addon should be considered experimental. But engines are production ready and many of the APIs are fully stable.

The [master branch of this addon](https://github.com/ember-engines/ember-engines)
is being developed against the master branch of Ember and Ember-CLI, and should
be considered unstable. If you're planning to deploy to production, please use
one of the stable releases.

[v0.5.15 or higher](https://github.com/ember-engines/ember-engines/tree/v0.5.15)
is compatible with FastBoot 1.0+.

## Introduction Video

[![Introduction to Ember Engines at Global Ember Meetup](https://i.vimeocdn.com/video/559400541_640x360.jpg)](https://vimeo.com/157688181)

## Installation

From your Ember CLI project's root directory, run the following:

```
ember install ember-engines
```

Install the appropriate version of Ember as noted above.

## Demo Projects

* [ember-engines-demo](https://github.com/dgeb/ember-engines-demo) - an example of a parent application (consumer).
  * ember-chat-engine - an example of a route-less engine that is an in-repo addon.
* [ember-blog-engine](https://github.com/dgeb/ember-blog-engine) - an example of a routable engine that is a separate addon project.

## Contributing

### Installation

* `git clone` this repository
* `npm install`

### Running

* `ember server`
* Visit your app at http://localhost:4200.

### Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).

## License

Copyright 2015-2018 Dan Gebhardt and Robert Jackson. MIT License (see LICENSE.md for details).
