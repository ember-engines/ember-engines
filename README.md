# ember-engines [![npm version](https://badge.fury.io/js/ember-engines.svg)](https://badge.fury.io/js/ember-engines) [![Build Status](https://travis-ci.org/ember-engines/ember-engines.svg?branch=master)](https://travis-ci.org/ember-engines/ember-engines)

This Ember addon implements the functionality described in the [Ember Engines
RFC](https://github.com/emberjs/rfcs/blob/master/text/0010-engines.md). Engines allow multiple logical
applications to be composed together into a single application from the user's
perspective.

## Compatibility

* Ember.js v3.12 or above
* Ember CLI v3.12 or above
* Node.js v10 or above

## Installation

From your Ember CLI project's root directory, run the following:

```sh
ember install ember-engines
```

## Documentation

Please refer to the [Ember Engines guides](http://ember-engines.com/) for help using Ember Engines.

## Demo Projects

- [ember-engines-demo](https://github.com/dgeb/ember-engines-demo) - an example of a parent application (consumer).
  - ember-chat-engine - an example of a route-less engine that is an in-repo addon.
- [ember-blog-engine](https://github.com/dgeb/ember-blog-engine) - an example of a routable engine that is a separate addon project.

## Support

Having trouble?

- **Join #ember-engines** on the [Ember Community Discord server](https://discord.gg/zT3asNS)

## Contributing

### Installation

- `git clone` this repository
- `yarn install`

### Running

- `ember server`
- Visit your app at http://localhost:4200.

### Running Tests

- `yarn test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
- `ember test`
- `ember test --server`

### Building

- `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).

## License

Copyright 2015-2020 Dan Gebhardt and Robert Jackson. MIT License (see [LICENSE.md](LICENSE.md) for details).
