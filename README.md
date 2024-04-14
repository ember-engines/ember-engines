# ember-engines [![npm version](https://badge.fury.io/js/ember-engines.svg)](https://badge.fury.io/js/ember-engines) [![Build Status](https://github.com/ember-engines/ember-engines/actions/workflows/ci.yml/badge.svg)](https://github.com/ember-engines/ember-engines/actions/workflows/ci.yml)

This Ember addon implements the functionality described in the [Ember Engines
RFC](https://github.com/emberjs/rfcs/blob/master/text/0010-engines.md). Engines allow multiple logical
applications to be composed together into a single application from the user's
perspective.

## Packages

This project is a monorepo managed by pnpm workspaces. All packages are
organized in the [/packages/](./packages/) directory.

The only public package is [ember-engines](./packages/ember-engines/). Other
packages are private to this repo and are used to support testing
`ember-engines`.

## Documentation

Check the full documentation in the [Ember Engines
Guides](http://ember-engines.com/).

## Support

Having trouble? **Join #ember-engines** on the [Ember Community Discord
server](https://discord.gg/zT3asNS)

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

Copyright 2015-2022 Dan Gebhardt, Michael Villander and Robert Jackson. MIT License (see
[LICENSE.md](LICENSE.md) for details).
